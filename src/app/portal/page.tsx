import { DocumentType } from "@prisma/client";
import { PortalTabsView } from "@/components/portal/PortalTabsView";
import { requireAuthenticatedClient } from "@/lib/client-auth";
import { getDefaultTaxYear, getTaxYearChoices } from "@/lib/document-options";
import { prisma } from "@/lib/prisma";

type PortalPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PortalTab = "profile" | "upload" | "returns";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const client = await requireAuthenticatedClient();
  const params = (await searchParams) || {};
  const error = readParam(params.error);
  const success = readParam(params.success);
  const requestedTab = readParam(params.tab) as PortalTab | undefined;
  const selectedTaxYearParam = Number.parseInt(readParam(params.taxYear) || "", 10);

  const documents = await prisma.document.findMany({
    where: {
      clientId: client.id,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  const uploadedDocuments = documents
    .filter((document) => document.type === DocumentType.CLIENT_UPLOAD)
    .map((document) => ({
      id: document.id,
      category: document.category,
      taxYear: document.taxYear,
      issuerName: document.issuerName,
      uploadedAt: document.uploadedAt.toISOString(),
    }));
  const finishedReturns = documents
    .filter((document) => document.type === DocumentType.ADMIN_RETURN)
    .map((document) => ({
      id: document.id,
      category: document.category,
      taxYear: document.taxYear,
      issuerName: document.issuerName,
      documentLabel: document.documentLabel,
      uploadedAt: document.uploadedAt.toISOString(),
    }));
  const needsProfile = !client.address || !client.phoneNumber;
  const taxYearChoices = getTaxYearChoices();
  const defaultTaxYear = getDefaultTaxYear();
  const selectedTaxYear = taxYearChoices.includes(selectedTaxYearParam) ? selectedTaxYearParam : defaultTaxYear;
  const initialTab: PortalTab =
    requestedTab === "profile" || requestedTab === "upload" || requestedTab === "returns"
      ? requestedTab
      : needsProfile
        ? "profile"
        : "upload";

  return (
    <PortalTabsView
      client={{
        name: client.name,
        email: client.email,
        address: client.address,
        phoneNumber: client.phoneNumber,
      }}
      error={error}
      success={success}
      needsProfile={needsProfile}
      initialTab={initialTab}
      selectedTaxYear={selectedTaxYear}
      taxYearChoices={taxYearChoices}
      uploadedDocuments={uploadedDocuments}
      finishedReturns={finishedReturns}
    />
  );
}
