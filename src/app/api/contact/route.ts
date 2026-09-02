import { after, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  parseContactSubmission,
  type ContactSubmission,
} from "@/lib/contact-submission";
import { prisma } from "@/lib/prisma";
import { validateRecaptcha } from "@/lib/recaptcha";
import { escapeHtml } from "@/lib/security";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendEmail(submission: ContactSubmission): Promise<void> {
  if (!resend) {
    console.warn("Skipping contact email because RESEND_API_KEY is not configured");
    return;
  }

  const name = escapeHtml(submission.name);
  const email = escapeHtml(submission.email);
  const message = escapeHtml(submission.message).replaceAll("\n", "<br />");
  const { error } = await resend.emails.send({
    from: "onboarding@dougmorgen.com",
    to: "doug@dougmorgen.com",
    subject: `New Contact Form Submission from ${submission.name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  if (error) {
    throw new Error("Failed to send contact notification", { cause: error });
  }

  const { error: confirmationError } = await resend.emails.send({
    from: "onboarding@dougmorgen.com",
    to: submission.email,
    subject: "We received your message",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out. We received your message and will get back to you soon.</p>
      <p><strong>Your message:</strong></p>
      <p>${message}</p>
    `,
  });

  if (confirmationError) {
    throw new Error("Failed to send contact confirmation", {
      cause: confirmationError,
    });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const submission = parseContactSubmission(input);

  if (!submission) {
    return NextResponse.json(
      { message: "Invalid contact form fields" },
      { status: 400 },
    );
  }

  if (!(await validateRecaptcha(submission.recaptchaToken))) {
    console.warn("Contact form rejected due to failed reCAPTCHA verification");
    return NextResponse.json(
      { message: "reCAPTCHA verification failed" },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.contactMessage.create({
        data: {
          name: submission.name,
          email: submission.email,
          message: submission.message,
        },
      }),
      prisma.leadCapture.upsert({
        where: { email: submission.email },
        update: { name: submission.name },
        create: {
          name: submission.name,
          email: submission.email,
          source: "contact_form",
        },
      }),
    ]);

    after(async () => {
      await sendEmail(submission).catch((error: unknown) => {
        console.error("Background contact email failed", error);
      });
    });

    return NextResponse.json({ message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Contact form POST failed", error);
    return NextResponse.json(
      { message: "Failed to submit contact form" },
      { status: 500 },
    );
  }
}
