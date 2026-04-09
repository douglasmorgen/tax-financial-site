-- Add optional label for finished return document type.
ALTER TABLE "Document"
ADD COLUMN "documentLabel" TEXT;
