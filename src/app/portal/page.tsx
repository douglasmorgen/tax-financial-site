import { DocumentType } from "@/generated/prisma/enums";
import { PortalTabsView } from "@/components/portal/PortalTabsView";
import { requireAuthenticatedClient } from "@/lib/client-auth";
import { getDefaultTaxYear, getTaxYearChoices } from "@/lib/document-options";
import { prisma } from "@/lib/prisma";

type PortalTab = "profile" | "upload" | "returns";

type SearchParam = string | string[] | undefined;

type PortalPageProps = {
  searchParams?: Promise<{
    error?: SearchParam;
    success?: SearchParam;
    tab?: SearchParam;
    taxYear?: SearchParam;
  }>;
};

function readParam(value: SearchParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isPortalTab(value: string | undefined): value is PortalTab {
  return value === "profile" || value === "upload" || value === "returns";
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const client = await requireAuthenticatedClient();
  const params = (await searchParams) || {};
  const error = readParam(params.error);
  const success = readParam(params.success);
  const requestedTab = readParam(params.tab);
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
    isPortalTab(requestedTab)
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
