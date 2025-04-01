'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-6 px-6">
      <nav className="flex justify-center space-x-8">
        <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Home
        </Link>
        <Link href="/contact" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Contact
        </Link>
      </nav>
    </header>
  );
} 