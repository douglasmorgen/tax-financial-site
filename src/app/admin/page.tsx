import Link from "next/link";
import { DocumentType } from "@prisma/client";
import {
  ADMIN_DOCUMENT_CATEGORIES,
  getDefaultTaxYear,
  getDocumentCategoryLabel,
  getTaxYearChoices,
} from "@/lib/document-options";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) || {};
  const error = formatMessage(params.error);
  const success = formatMessage(params.success);
  const selectedTaxYearParam = Number.parseInt(formatMessage(params.taxYear) || "", 10);

  const [contactMessages, leads, clients] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.leadCapture.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.client.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    }),
  ]);
  const taxYearChoices = getTaxYearChoices();
  const selectedTaxYear = taxYearChoices.includes(selectedTaxYearParam)
    ? selectedTaxYearParam
    : getDefaultTaxYear();

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Secure Client Portal</p>
          <h1 className="mt-3 text-4xl font-semibold">Admin Dashboard</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            Clients can sign up through the public portal. Use this dashboard to review uploads and store completed returns without exposing files publicly.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            Action completed: {success}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            Action failed: {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Portal Access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Clients create their own accounts at the public sign-up page, then use the portal to upload source documents and download finished returns.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/portal/sign-up"
                className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Client Sign Up
              </Link>
              <p className="text-xs text-slate-500">
                New signups automatically create a client record the first time they enter the portal.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Upload Finished Return</h2>
            <p className="mt-2 text-sm text-slate-600">
              Files are posted to the server and stored in your private S3 bucket with server-side encryption enabled.
            </p>
            <form
              action="/api/admin/documents"
              method="post"
              encType="multipart/form-data"
              className="mt-6 space-y-4"
            >
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Client</span>
                <select
                  name="clientId"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Tax year</span>
                <select
                  name="taxYear"
                  required
                  defaultValue={selectedTaxYear}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                >
                  {taxYearChoices.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Category</span>
                <select
                  name="category"
                  required
                  defaultValue={ADMIN_DOCUMENT_CATEGORIES[0]}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                >
                  {ADMIN_DOCUMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {getDocumentCategoryLabel(category)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Employer / Brokerage / Bank (optional)</span>
                <input
                  name="issuerName"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Fidelity, Schwab, Chase"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Return file</span>
                <input
                  name="file"
                  type="file"
                  required
                  className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Upload Return
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Client Accounts</h2>
              <p className="mt-1 text-sm text-slate-600">Activation links, uploaded source files, and delivered returns.</p>
            </div>
            <Link href="/portal/login" className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline">
              Open client login
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            {clients.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                No clients have been added yet.
              </p>
            ) : (
              clients.map((client) => {
                const clientUploads = client.documents.filter((document) => document.type === DocumentType.CLIENT_UPLOAD);
                const finishedReturns = client.documents.filter((document) => document.type === DocumentType.ADMIN_RETURN);

                return (
                  <article key={client.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{client.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{client.email}</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-500">{client.address || "Address not provided yet"}</p>
                        <p className="mt-1 text-sm text-slate-500">{client.phoneNumber || "Phone not provided yet"}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">Portal status:</span> Active once the client signs in
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-slate-900">Joined:</span>{" "}
                          {new Date(client.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-6 lg:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Client uploads</h4>
                        <ul className="mt-3 space-y-3">
                          {clientUploads.length === 0 ? (
                            <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No uploads yet.</li>
                          ) : (
                            clientUploads.map((document) => (
                              <li key={document.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-slate-900">{document.fileName}</p>
                                    <p className="text-xs text-slate-500">
                                      {document.taxYear} • {getDocumentCategoryLabel(document.category)} • Uploaded {new Date(document.uploadedAt).toLocaleString()} by {document.uploadedBy}
                                    </p>
                                    {document.issuerName ? (
                                      <p className="text-xs text-slate-500">Institution: {document.issuerName}</p>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={`/api/admin/documents/${document.id}/download`}
                                      className="text-xs font-semibold text-slate-700 underline-offset-4 hover:underline"
                                    >
                                      Download
                                    </a>
                                    <form action={`/api/admin/documents/${document.id}/delete`} method="post">
                                      <button
                                        type="submit"
                                        className="text-xs font-semibold text-rose-700 underline-offset-4 hover:underline"
                                      >
                                        Delete
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Finished returns</h4>
                        <ul className="mt-3 space-y-3">
                          {finishedReturns.length === 0 ? (
                            <li className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                              No completed returns uploaded yet.
                            </li>
                          ) : (
                            finishedReturns.map((document) => (
                              <li key={document.id} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-emerald-950">{document.fileName}</p>
                                    <p className="text-xs text-emerald-700">
                                      {document.taxYear} • {getDocumentCategoryLabel(document.category)} • Uploaded {new Date(document.uploadedAt).toLocaleString()}
                                    </p>
                                    {document.issuerName ? (
                                      <p className="text-xs text-emerald-700">Institution: {document.issuerName}</p>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={`/api/admin/documents/${document.id}/download`}
                                      className="text-xs font-semibold text-emerald-900 underline-offset-4 hover:underline"
                                    >
                                      Download
                                    </a>
                                    <form action={`/api/admin/documents/${document.id}/delete`} method="post">
                                      <button
                                        type="submit"
                                        className="text-xs font-semibold text-rose-700 underline-offset-4 hover:underline"
                                      >
                                        Delete
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Recent Contact Messages</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 pr-6 font-medium">Date</th>
                    <th className="pb-3 pr-6 font-medium">Name</th>
                    <th className="pb-3 pr-6 font-medium">Email</th>
                    <th className="pb-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {contactMessages.map((message) => (
                    <tr key={message.id}>
                      <td className="py-3 pr-6">{new Date(message.createdAt).toLocaleString()}</td>
                      <td className="py-3 pr-6 font-medium text-slate-900">{message.name}</td>
                      <td className="py-3 pr-6">{message.email}</td>
                      <td className="py-3">{message.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Recent Leads</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 pr-6 font-medium">Date</th>
                    <th className="pb-3 pr-6 font-medium">Name</th>
                    <th className="pb-3 pr-6 font-medium">Email</th>
                    <th className="pb-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-3 pr-6">{new Date(lead.createdAt).toLocaleString()}</td>
                      <td className="py-3 pr-6 font-medium text-slate-900">{lead.name || "-"}</td>
                      <td className="py-3 pr-6">{lead.email}</td>
                      <td className="py-3">{lead.phoneNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
