import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <header className="text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Expert Tax, Financial & Investment Planning for Tech Professionals
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          I help individuals and startups navigate complex financial challenges, optimize taxes, and make informed decisions about RSUs, stock options, and cap tables.
        </p>
      </header>

      <section className="mb-16 text-center">
        <h3 className="text-4xl font-semibold text-gray-900 mb-8">Why Choose Me?</h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          I specialize in creating personalized financial plans that work for you. Whether it&apos;s maximizing your tax efficiency or understanding the intricacies of equity compensation, I&apos;m here to guide you through whatever you&apos;re facing next.
        </p>
      </section>      

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4 text-center">
          <h3 className="text-3xl font-semibold text-gray-900">Tax & Financial Planning</h3>
          <p className="text-lg text-gray-600">
            Get expert advice on managing your finances with a strategy that reduces taxes and prepares for long-term growth.
          </p>
        </div>
        <div className="space-y-4 text-center">
          <h3 className="text-3xl font-semibold text-gray-900">RSU & Stock Options</h3>
          <p className="text-lg text-gray-600">
            Understand your stock compensation options and make informed decisions to grow your wealth with RSUs and stock options.
          </p>
        </div>
        <div className="space-y-4 text-center">
          <h3 className="text-3xl font-semibold text-gray-900">Cap Table Management</h3>
          <p className="text-lg text-gray-600">
            I&apos;ll help you manage your startup&apos;s cap table, ensuring clarity and control as your company grows.
          </p>
        </div>
        <div className="space-y-4 text-center">
          <h3 className="text-3xl font-semibold text-gray-900">Investment Planning</h3>
          <p className="text-lg text-gray-600">
            Build a custom investment strategy that aligns with your financial goals and risk tolerance.
          </p>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Let&apos;s discuss your financial future. Reach out now to schedule a consultation and take the first step toward optimizing your finances.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Contact Me
        </Link>
      </section>
    </div>
  );
}
