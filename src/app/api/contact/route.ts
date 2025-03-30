import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "../../../lib/prisma";

const sendEmail = async (name: string, email: string, message: string) => {
  const emailData = {
    from: "your-email@example.com",
    to: "your-email@example.com",
    subject: `New Contact Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  };

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      emailData,
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send emails");
  }
};

export async function POST(req: Request) {
  const { name, email, message, recaptchaToken } = await req.json();

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (recaptchaToken) {
    try {
      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: secretKey,
            response: recaptchaToken,
          },
        }
      );

      if (!recaptchaResponse.data.success) {
        return NextResponse.json({ message: "reCAPTCHA verification failed" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ message: "reCAPTCHA verification failed" }, { status: 500 });
    }
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    await sendEmail(name, email, message);

    return NextResponse.json({ message: `Your message from ${name} has been sent successfully!` });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json({ message: "An error occurred. Please try again later." }, { status: 500 });
  }
}
