export function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : null;
}

export function readFormFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);

  return value instanceof File ? value : null;
}

export function parseInteger(value: string | null): number | null {
  if (!value || !/^-?\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
