import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "../../../lib/prisma";
import { validateRecaptcha } from "../../../lib/recaptcha";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  console.log("Email sent:", data);
  return data;
};

export async function POST(req: Request) {
  const { name, email, message, recaptchaToken } = await req.json();

  const recaptchaValid = await validateRecaptcha(recaptchaToken);
  if (!recaptchaValid) {
    return NextResponse.json(
      { message: "reCAPTCHA verification failed" },
      { status: 400 }
    );
  }

  const emailResult = await sendEmail(name, email, message);
  if (emailResult instanceof NextResponse) {
    return emailResult;
  }

  await Promise.all([
    createContactMessage(name, email, message),
    createLead(name, email),
  ]);

  return NextResponse.json({
    message: `Your message from ${name} has been sent successfully!`,
  });
}
