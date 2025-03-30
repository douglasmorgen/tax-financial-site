'use client';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setError("Please verify you're not a robot.");
      return;
    }

    try {
      const response = await axios.post('/api/contact', {
        name,
        email,
        message,
        recaptchaToken,
      });

      if (response.status === 200) {
        setSuccess('Your message has been sent successfully!');
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      <h1 className="text-5xl font-semibold text-center text-gray-800 mb-8">Contact Me</h1>

      {success && <p className="text-green-600 text-lg mb-4">{success}</p>}
      {error && <p className="text-red-600 text-lg mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="name" className="text-xl font-semibold text-gray-800">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-xl font-semibold text-gray-800">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="text-xl font-semibold text-gray-800">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={handleRecaptchaChange}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
