'use client';
import React, { useState, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ContactForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!executeRecaptcha) {
        setError('ReCAPTCHA not yet available. Please try again later.');
        return;
      }

      try {
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        const recaptchaToken = await executeRecaptcha('contact_form');

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            message,
            recaptchaToken,
          }),
        });

        if (response.ok) {
          setSuccess('Thank you for reaching out! We’ll get back to you as soon as possible.');
          setName('');
          setEmail('');
          setMessage('');
        } else {
          throw new Error('Request failed');
        }
      } catch {
        setError('Oops! Something went wrong. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [executeRecaptcha, isSubmitting, name, email, message]
  );

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      <h1 className="text-5xl font-semibold text-center text-gray-800 mb-8">
        Get in touch with Doug
      </h1>

      {success && <p className="text-green-600 text-lg mb-4">{success}</p>}
      {error && <p className="text-red-600 text-lg mb-4">{error}</p>}

      {/* Testimonial Bubbles */}
      <div className="space-y-6 mb-12">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <p className="text-lg text-gray-800 font-semibold">
            &quot;Doug increased my annual returns by 2% with less risk and saved me $25,000 a year over my previous financial advisor!&quot;
          </p>
          <p className="text-sm text-gray-600 mt-2">– Sarah M., Founder, Tech Startup</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-md">
          <p className="text-lg text-gray-800 font-semibold">
            &quot;I wish I&apos;d met Doug sooner. His tax strategies saved me tens of thousands of dollars!&quot;
          </p>
          <p className="text-sm text-gray-600 mt-2">– John D., Venture Capitalist</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
          <p className="text-lg text-gray-800 font-semibold">
            &quot;Doug helped me optimize my ISOs, resulting in a more profitable exit from my startup without triggering AMT&apos;s.&quot;
          </p>
          <p className="text-sm text-gray-600 mt-2">– Emma R., Software Engineer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="name" className="text-xl font-semibold text-gray-800">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-xl font-semibold text-gray-800">
            Your Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="text-xl font-semibold text-gray-800">
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-lg py-3 text-xl font-semibold text-white shadow-lg transition duration-300 ${
            isSubmitting
              ? 'cursor-not-allowed bg-slate-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

const ContactPage = () => (
  <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
    <ContactForm />
  </GoogleReCaptchaProvider>
);

export default ContactPage;
