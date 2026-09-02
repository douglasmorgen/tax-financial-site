import { describe, expect, it } from "vitest";
import { parseContactSubmission } from "@/lib/contact-submission";

const validSubmission = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I need help with my return.",
  recaptchaToken: "verified-token",
};

describe("parseContactSubmission", () => {
  it("normalizes a valid submission", () => {
    expect(
      parseContactSubmission({
        ...validSubmission,
        name: "  Ada Lovelace  ",
        email: "  ADA@EXAMPLE.COM  ",
        message: "  I need help with my return.  ",
      }),
    ).toEqual(validSubmission);
  });

  it.each([
    null,
    [],
    "submission",
    { ...validSubmission, name: "" },
    { ...validSubmission, email: "not-an-email" },
    { ...validSubmission, message: 42 },
    { ...validSubmission, recaptchaToken: " " },
  ])("rejects invalid input %#", (input) => {
    expect(parseContactSubmission(input)).toBeNull();
  });

  it("enforces field length limits", () => {
    expect(
      parseContactSubmission({
        ...validSubmission,
        name: "a".repeat(121),
      }),
    ).toBeNull();

    expect(
      parseContactSubmission({
        ...validSubmission,
        message: "a".repeat(5_001),
      }),
    ).toBeNull();
  });
});
