import { isObjectRecord } from "@/lib/request-data";

export type ContactSubmission = Readonly<{
  email: string;
  message: string;
  name: string;
  recaptchaToken: string;
}>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readStringField(
  input: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null {
  const value = input[key];

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized && normalized.length <= maxLength ? normalized : null;
}

export function parseContactSubmission(input: unknown): ContactSubmission | null {
  if (!isObjectRecord(input)) {
    return null;
  }

  const name = readStringField(input, "name", 120);
  const email = readStringField(input, "email", 320)?.toLowerCase() ?? null;
  const message = readStringField(input, "message", 5_000);
  const recaptchaToken = readStringField(input, "recaptchaToken", 10_000);

  if (!name || !email || !EMAIL_PATTERN.test(email) || !message || !recaptchaToken) {
    return null;
  }

  return {
    name,
    email,
    message,
    recaptchaToken,
  };
}
