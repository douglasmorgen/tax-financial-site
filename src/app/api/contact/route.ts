import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "../../../lib/prisma";
import { validateRecaptcha } from "../../../lib/recaptcha";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const createContactMessage = async (name: string, email: string, message: string) => {
  return prisma.contactMessage.create({
    data: {
      name,
      email,
      message,
    },
  });
};

const createLead = async (name: string, email: string) => {
  await prisma.leadCapture.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      source: "contact_form",
    },
  });
};

const sendEmail = async (name: string, email: string, message: string) => {
  if (!resend) {
    console.warn("Skipping contact email because RESEND_API_KEY is not configured");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: "onboarding@dougmorgen.com",
    to: "doug@dougmorgen.com",
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p> 
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  if (error) {
    console.error("Error sending email:", error);
    return;
  }

  console.log("Email sent:", data);

  const { data: confirmationData, error: confirmationError } = await resend.emails.send({
    from: "onboarding@dougmorgen.com",
    to: email,
    subject: "We received your message",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out. We received your message and will get back to you soon.</p>
      <p><strong>Your message:</strong></p>
      <p>${message}</p>
    `,
  });

  if (confirmationError) {
    console.error("Error sending contact confirmation email:", confirmationError);
    return;
  }

  console.log("Contact confirmation email sent:", confirmationData);
};

export async function POST(req: Request) {
  try {
    const { name, email, message, recaptchaToken } = await req.json();

    if (!name || !email || !message || !recaptchaToken) {
      console.warn("Contact form rejected due to missing fields");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const recaptchaValid = await validateRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      console.warn("Contact form rejected due to failed reCAPTCHA verification");
      return NextResponse.json(
        { message: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    await Promise.all([
      createContactMessage(name, email, message),
      createLead(name, email),
    ]);

    void sendEmail(name, email, message).catch((error) => {
      console.error("Background contact email failed:", error);
    });

    return NextResponse.json({
      message: `Your message from ${name} has been sent successfully!`,
    });
  } catch (error) {
    console.error("Contact form POST failed:", error);
    return NextResponse.json(
      { message: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
