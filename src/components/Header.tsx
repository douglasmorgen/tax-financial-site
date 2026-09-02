import Link from "next/link";

export default function Header() {
  return (
    <header className="px-6 py-6">
      <nav className="flex justify-center space-x-8">
        <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Home
        </Link>
        <Link href="/contact" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Contact
        </Link>
        <Link href="/tax-appointment-checklist" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Tax Checklist
        </Link>
        <Link href="/portal/login" className="text-lg font-semibold text-gray-800 hover:text-blue-600">
          Client Portal
        </Link>
      </nav>
    </header>
  );
}
