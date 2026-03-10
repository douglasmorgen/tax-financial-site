-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CLIENT_UPLOAD', 'ADMIN_RETURN');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM (
    'W2',
    'W2G',
    'FORM_1099_INT',
    'FORM_1099_DIV',
    'FORM_1099_B',
    'FORM_1099_R',
    'FORM_1099_MISC',
    'FORM_1099_NEC',
    'FORM_1099_G',
    'FORM_1098',
    'FORM_1095',
    'K1',
    'BROKERAGE_STATEMENT',
    'BANK_STATEMENT',
    'CRYPTO_STATEMENT',
    'RETIREMENT_STATEMENT',
    'PRIOR_YEAR_RETURN',
    'ESTIMATED_TAX_PAYMENT',
    'ID_DOCUMENT',
    'IRS_NOTICE',
    'COMPLETED_RETURN',
    'OTHER'
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "issuerName" TEXT,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
