import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2026 Tax Appointment Checklist",
  description: "What to upload for your 2025 tax return preparation.",
};

const incomeItems = [
  "W-2s from each employer and your final 2025 pay stub(s).",
  "1099-INT and 1099-DIV for interest and dividends.",
  "1099-R for pensions, IRA distributions, and rollovers (include qualified charitable distributions if applicable).",
  "SSA-1099 for Social Security benefits.",
  "1099-G for unemployment compensation (if applicable).",
  "Brokerage and mutual fund tax packets, including year-end statements and municipal interest.",
  "Crypto activity reports and 1099s from your exchange/brokerage.",
  "Gambling/lottery winnings, prizes, awards, jury duty pay, and executor fees.",
  "1099-SA for HSA distributions.",
  "Settlement statements for any real estate purchase, sale, or refinance in 2025.",
  "Amount of PTR and/or ANCHOR rebate paid in 2025.",
];

const deductionItems = [
  "Medical expenses (see the medical section below).",
  "Real estate taxes paid for each property you own.",
  "Sales tax paid on major purchases (car, boat, motor home).",
  "Finance charges on eligible new U.S.-assembled vehicles.",
  "Mortgage interest (Form 1098), including home equity loans if applicable.",
  "Charitable contributions (cash/check/goods) with proper documentation and receipts.",
  "Volunteer mileage for charitable service.",
];

const creditItems = [
  "Form 1098-T and a college account statement showing tuition/fee/book payments.",
  "Form 1098-E for student loan interest.",
  "Educator out-of-pocket classroom expenses.",
];

const estimatedTaxItems = [
  "IRS and state quarterly estimated payments: amount and date for April 2025, June 2025, September 2025, and January 2026.",
  "Do not include your January 2025 payment (that applies to tax year 2024).",
];

const medicalItems = [
  "Medical insurance premiums for taxpayer, spouse, and dependents.",
  "Long-term care insurance premiums.",
  "Doctor/dentist bills and co-pays.",
  "Therapy, hospital, clinic, lab, and X-ray costs.",
  "Hearing aids and batteries.",
  "Eyeglasses and contact lenses.",
  "Medical aids (wheelchairs, crutches, braces, etc.).",
  "Prescription medications.",
  "Transportation costs for medical care (ambulance, taxi, parking, tolls).",
  "Long-term care expenses.",
  "Medical mileage from January 1, 2025 through December 31, 2025.",
];

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-700">
            <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function TaxAppointmentChecklistPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Tax Year 2025</p>
        <h1 className="mt-3 text-4xl font-semibold">2026 Tax Appointment Checklist</h1>
        <p className="mt-3 text-lg text-slate-200">
          Use this as your annual prep guide before your appointment. Not every item applies to everyone, but review the
          full list so you can upload everything needed in advance.
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-xl font-semibold text-blue-900">Important Reminders</h2>
        <ul className="mt-3 space-y-2 text-blue-900">
          <li>
            If your driver&apos;s license was renewed during 2025, upload a copy or provide the issue and expiration dates.
          </li>
          <li>
            If anyone in your household had Marketplace insurance, upload Form 1095-A. Forms 1095-B/1095-C are usually
            not required for return prep.
          </li>
          <li>
            If your bank account changed in 2025, upload a voided check or savings statement for direct deposit/debit.
          </li>
          <li>
            You can securely submit documents ahead of time through the{" "}
            <Link href="/portal/login" className="font-semibold underline underline-offset-4">
              client portal
            </Link>
            .
          </li>
        </ul>
      </section>

      <div className="mt-8 space-y-6">
        <ChecklistSection title="Income Sources" items={incomeItems} />
        <ChecklistSection title="Deductions" items={deductionItems} />
        <ChecklistSection title="Credits & Adjustments" items={creditItems} />
        <ChecklistSection title="Estimated Taxes Paid" items={estimatedTaxItems} />
      </div>

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-2xl font-semibold text-emerald-900">Medical Expense Notes</h2>
        <p className="mt-2 text-emerald-900">
          Even if medical expenses do not help federally, they may still help on New Jersey returns. If you are over 62,
          some NJ income thresholds may reduce the need for medical detail.
        </p>
        <ul className="mt-4 space-y-2 text-emerald-900">
          {medicalItems.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Questions Before Your Appointment?</h2>
        <p className="mt-2 text-slate-700">
          Upload any other records you think may be relevant. If you&apos;re unsure, send a quick message and we&apos;ll
          confirm what&apos;s needed.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Contact the Office
          </Link>
          <Link
            href="/portal/login"
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open Client Portal
          </Link>
        </div>
      </section>
    </div>
  );
}
