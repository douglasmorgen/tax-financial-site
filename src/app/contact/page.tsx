"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!executeRecaptcha) {
        setError("ReCAPTCHA is not yet available. Please try again shortly.");
        return;
      }

      try {
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        const recaptchaToken = await executeRecaptcha("contact_form");
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            message,
            recaptchaToken,
          }),
        });

        if (!response.ok) {
          throw new Error("Contact request failed");
        }

        setSuccess("Thank you for reaching out! We’ll get back to you as soon as possible.");
        setName("");
        setEmail("");
        setMessage("");
      } catch {
        setError("Something went wrong. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, executeRecaptcha, isSubmitting, message, name],
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-10">
      <h1 className="mb-8 text-center text-5xl font-semibold text-gray-800">
        Get in touch with Doug
      </h1>

      {success ? (
        <p role="status" className="mb-4 text-lg text-green-600">
          {success}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-4 text-lg text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mb-12 space-y-6">
        <div className="rounded-lg bg-blue-100 p-4 shadow-md">
          <p className="text-lg font-semibold text-gray-800">
            &quot;Doug increased my annual returns by 2% with less risk and saved me $25,000 a year over my previous financial advisor!&quot;
          </p>
          <p className="mt-2 text-sm text-gray-600">– Sarah M., Founder, Tech Startup</p>
        </div>
        <div className="rounded-lg bg-green-100 p-4 shadow-md">
          <p className="text-lg font-semibold text-gray-800">
            &quot;I wish I&apos;d met Doug sooner. His tax strategies saved me tens of thousands of dollars!&quot;
          </p>
          <p className="mt-2 text-sm text-gray-600">– John D., Venture Capitalist</p>
        </div>
        <div className="rounded-lg bg-yellow-100 p-4 shadow-md">
          <p className="text-lg font-semibold text-gray-800">
            &quot;Doug helped me optimize my ISOs, resulting in a more profitable exit from my startup without triggering AMTs.&quot;
          </p>
          <p className="mt-2 text-sm text-gray-600">– Emma R., Software Engineer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="name" className="text-xl font-semibold text-gray-800">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-xl font-semibold text-gray-800">
            Your Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={320}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="text-xl font-semibold text-gray-800">
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            maxLength={5000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-lg py-3 text-xl font-semibold text-white shadow-lg transition duration-300 ${
            isSubmitting
              ? "cursor-not-allowed bg-slate-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default function ContactPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h1 className="text-4xl font-semibold text-gray-800">Contact form unavailable</h1>
        <p className="mt-4 text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <ContactForm />
    </GoogleReCaptchaProvider>
  );
}
