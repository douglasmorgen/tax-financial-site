const PORTAL_SUCCESS_MESSAGES: ReadonlyMap<string, string> = new Map([
  ["document-uploaded", "Your document was uploaded successfully."],
  ["document-deleted", "Your document was deleted successfully."],
  ["profile-updated", "Your profile was updated successfully."],
]);

const PORTAL_ERROR_MESSAGES: ReadonlyMap<string, string> = new Map([
  ["missing-file", "Choose a document and complete all required fields."],
  ["invalid-document-category", "Choose a supported document category."],
  ["invalid-tax-year", "Choose one of the available tax years."],
  ["invalid-issuer-name", "The institution name is too long."],
  ["invalid-file-size", "The document must be between 1 byte and 25 MiB."],
  ["invalid-file-type", "Upload a PDF, JPEG, PNG, WebP, or HEIC document."],
  ["document-upload-failed", "The document could not be uploaded. Please try again."],
  ["missing-profile-name", "Enter a name for your client profile."],
  ["invalid-profile", "One or more profile fields are too long."],
]);

const ADMIN_SUCCESS_MESSAGES: ReadonlyMap<string, string> = new Map([
  ["return-uploaded", "The completed document was uploaded."],
  ["document-deleted", "The document was deleted."],
]);

const ADMIN_ERROR_MESSAGES: ReadonlyMap<string, string> = new Map([
  ["missing-document-fields", "Complete all required document fields."],
  ["invalid-client", "Choose a valid client."],
  ["invalid-document-category", "Choose a supported document category."],
  ["invalid-tax-year", "Choose one of the available tax years."],
  ["invalid-document-size", "The document must be between 1 byte and 25 MiB."],
  ["invalid-document-type", "Upload a PDF, JPEG, PNG, WebP, or HEIC document."],
  ["invalid-return-type", "Choose a supported return type."],
  ["invalid-state", "Choose a valid state for this return type."],
  ["document-upload-failed", "The document could not be uploaded."],
  ["document-not-found", "The requested document was not found."],
  ["document-delete-failed", "The document could not be deleted."],
]);

function resolveActionMessage(
  code: string | undefined,
  messages: ReadonlyMap<string, string>,
  fallback: string,
): string | undefined {
  return code ? messages.get(code) ?? fallback : undefined;
}

export function getPortalSuccessMessage(code: string | undefined): string | undefined {
  return resolveActionMessage(code, PORTAL_SUCCESS_MESSAGES, "The action completed successfully.");
}

export function getPortalErrorMessage(code: string | undefined): string | undefined {
  return resolveActionMessage(code, PORTAL_ERROR_MESSAGES, "The action could not be completed.");
}

export function getAdminSuccessMessage(code: string | undefined): string | undefined {
  return resolveActionMessage(code, ADMIN_SUCCESS_MESSAGES, "The action completed successfully.");
}

export function getAdminErrorMessage(code: string | undefined): string | undefined {
  return resolveActionMessage(code, ADMIN_ERROR_MESSAGES, "The action could not be completed.");
}
