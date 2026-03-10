"use client";

import { type MouseEvent, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { DocumentCategory } from "@prisma/client";
import { CLIENT_DOCUMENT_CATEGORIES, getDocumentCategoryLabel } from "@/lib/document-options";

type PortalTab = "profile" | "upload" | "returns";

type PortalDocument = {
  id: string;
  fileName: string;
  category: DocumentCategory;
  taxYear: number;
  issuerName: string | null;
  uploadedAt: string;
};

type PortalTabsViewProps = {
  client: {
    name: string;
    email: string;
    address: string | null;
    phoneNumber: string | null;
  };
  error?: string;
  success?: string;
  needsProfile: boolean;
  initialTab: PortalTab;
  selectedTaxYear: number;
  taxYearChoices: number[];
  uploadedDocuments: PortalDocument[];
  finishedReturns: PortalDocument[];
};

export function PortalTabsView({
  client,
  error,
  success,
  needsProfile,
  initialTab,
  selectedTaxYear,
  taxYearChoices,
  uploadedDocuments,
  finishedReturns,
}: PortalTabsViewProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>(initialTab);
  const [uploadedDocumentsState, setUploadedDocumentsState] = useState(uploadedDocuments);
  const [uploadedFilesYearFilter, setUploadedFilesYearFilter] = useState<string>(String(selectedTaxYear));
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
  const [clickedDownloadIds, setClickedDownloadIds] = useState<Set<string>>(new Set());
  const [deletingDocumentIds, setDeletingDocumentIds] = useState<Set<string>>(new Set());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const successMessage =
    success === "document-uploaded"
      ? "Your document was uploaded successfully."
      : success === "document-deleted"
        ? "Your document was deleted successfully."
        : success === "profile-updated"
          ? "Your profile was updated successfully."
          : success;

  const tabClassName = (tab: PortalTab) =>
    `cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab
      ? "bg-slate-900 text-white"
      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
    }`;
  const filteredUploadedDocuments =
    uploadedFilesYearFilter === "all"
      ? uploadedDocumentsState
      : uploadedDocumentsState.filter((document) => document.taxYear === Number.parseInt(uploadedFilesYearFilter, 10));

  async function handleDeleteDocument(documentId: string) {
    if (deletingDocumentIds.has(documentId)) {
      return;
    }

    setDeletingDocumentIds((ids) => new Set(ids).add(documentId));

    const response = await fetch(`/api/client/documents/${documentId}/delete`, {
      method: "POST",
    });

    if (!response.ok) {
      setDeletingDocumentIds((ids) => {
        const nextIds = new Set(ids);
        nextIds.delete(documentId);
        return nextIds;
      });
      alert("Unable to delete document right now. Please try again.");
      return;
    }

    setUploadedDocumentsState((documents) => documents.filter((document) => document.id !== documentId));
    setActionSuccessMessage("Your document was deleted successfully.");
    setDeletingDocumentIds((ids) => {
      const nextIds = new Set(ids);
      nextIds.delete(documentId);
      return nextIds;
    });
  }

  function handleDownloadClick(event: MouseEvent<HTMLAnchorElement>, documentId: string) {
    if (clickedDownloadIds.has(documentId)) {
      event.preventDefault();
      return;
    }

    setClickedDownloadIds((ids) => new Set(ids).add(documentId));
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white px-8 py-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Secure Client Portal</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Welcome, {client.name}</h1>
              <p className="mt-2 text-sm text-slate-600">{client.email}</p>
            </div>
            <UserButton afterSignOutUrl="/portal/login" />
          </div>
        </div>

        {successMessage || actionSuccessMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {actionSuccessMessage ?? successMessage}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            Action failed: {error}
          </div>
        ) : null}

        <nav className="rounded-3xl bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setActiveTab("profile")} className={tabClassName("profile")}>
              Profile
            </button>
            <button type="button" onClick={() => setActiveTab("upload")} className={tabClassName("upload")}>
              Upload Documents
            </button>
            <button type="button" onClick={() => setActiveTab("returns")} className={tabClassName("returns")}>
              Finished Returns
            </button>
          </div>
        </nav>

        {activeTab === "profile" ? (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              {needsProfile ? "Complete Your Profile" : "Profile"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Add or update your preferred name, mailing address, and phone number for your client account.
            </p>
            <form action="/api/client/profile" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Name</span>
                <input
                  name="name"
                  defaultValue={client.name}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Phone number</span>
                <input
                  name="phoneNumber"
                  defaultValue={client.phoneNumber || ""}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Mailing address</span>
                <textarea
                  name="address"
                  defaultValue={client.address || ""}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                />
              </label>
              <div>
                <button
                  type="submit"
                  className="cursor-pointer rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {activeTab === "upload" ? (
          <div className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Upload Documents</h2>
              <p className="mt-2 text-sm text-slate-600">
                Upload source documents directly through the portal. Files are stored privately and never exposed publicly.
              </p>
              <form
                action="/api/client/documents"
                method="post"
                encType="multipart/form-data"
                onSubmit={() => setIsSubmittingUpload(true)}
                className="mt-6 space-y-4"
              >
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Tax year</span>
                  <select
                    name="taxYear"
                    required
                    defaultValue={selectedTaxYear}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    {taxYearChoices.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Document category</span>
                  <select
                    name="category"
                    required
                    defaultValue={CLIENT_DOCUMENT_CATEGORIES[0]}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    {CLIENT_DOCUMENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {getDocumentCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Employer / Brokerage / Bank (optional)</span>
                  <input
                    type="text"
                    name="issuerName"
                    maxLength={120}
                    placeholder="e.g. Google, Fidelity, Chase"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Select document</span>
                  <input
                    type="file"
                    name="file"
                    required
                    className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmittingUpload}
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white ${isSubmittingUpload
                    ? "cursor-not-allowed bg-slate-400"
                    : "cursor-pointer bg-slate-900 hover:bg-slate-800"
                    }`}
                >
                  Upload Securely
                </button>
              </form>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Previously Uploaded Files</h2>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Filter by year</span>
                  <select
                    value={uploadedFilesYearFilter}
                    onChange={(event) => setUploadedFilesYearFilter(event.target.value)}
                    className="w-full min-w-40 rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                  >
                    <option value="all">All years</option>
                    {taxYearChoices.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ul className="mt-5 space-y-3">
                {filteredUploadedDocuments.length === 0 ? (
                  <li className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    You have not uploaded any documents yet.
                  </li>
                ) : (
                  filteredUploadedDocuments.map((document) => {
                    const downloadClicked = clickedDownloadIds.has(document.id);
                    const isDeleting = deletingDocumentIds.has(document.id);

                    return (
                      <li key={document.id} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              {getDocumentCategoryLabel(document.category)} • Tax Year {document.taxYear}
                            </p>
                            <p className="font-semibold text-slate-900">{document.fileName}</p>
                            <p className="text-xs text-slate-500">
                              Uploaded {new Date(document.uploadedAt).toLocaleString()}
                            </p>
                            {document.issuerName ? (
                              <p className="mt-1 text-xs font-medium text-slate-600">Institution: {document.issuerName}</p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={`/api/client/documents/${document.id}/download`}
                              onClick={(event) => handleDownloadClick(event, document.id)}
                              aria-disabled={downloadClicked}
                              className={`text-xs font-semibold underline-offset-4 ${downloadClicked
                                ? "cursor-not-allowed text-slate-400 no-underline pointer-events-none"
                                : "cursor-pointer text-slate-700 hover:underline"
                                }`}
                            >
                              Download your copy
                            </a>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteDocument(document.id)}
                              className={`text-xs font-semibold underline-offset-4 ${isDeleting
                                ? "cursor-not-allowed text-slate-400"
                                : "cursor-pointer text-rose-700 hover:underline"
                                }`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </div>
        ) : null}

        {activeTab === "returns" ? (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Finished Returns</h2>
            <p className="mt-2 text-sm text-slate-600">
              Download your completed returns once your taxes are done.
            </p>
            <ul className="mt-5 space-y-3">
              {finishedReturns.length === 0 ? (
                <li className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  No finished returns are available yet.
                </li>
              ) : (
                finishedReturns.map((document) => (
                  <li key={document.id} className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{document.fileName}</p>
                        <p className="text-xs text-emerald-700">
                          {document.taxYear} • {getDocumentCategoryLabel(document.category)} • Uploaded{" "}
                          {new Date(document.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <a
                        href={`/api/client/documents/${document.id}/download`}
                        onClick={(event) => handleDownloadClick(event, document.id)}
                        aria-disabled={clickedDownloadIds.has(document.id)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold text-white ${clickedDownloadIds.has(document.id)
                          ? "pointer-events-none cursor-not-allowed bg-slate-400"
                          : "cursor-pointer bg-emerald-600 hover:bg-emerald-500"
                          }`}
                      >
                        Download
                      </a>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
