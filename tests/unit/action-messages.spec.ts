import { describe, expect, it } from "vitest";
import {
  getAdminErrorMessage,
  getAdminSuccessMessage,
  getPortalErrorMessage,
  getPortalSuccessMessage,
} from "@/lib/action-messages";

describe("action messages", () => {
  it("maps known portal and admin result codes", () => {
    expect(getPortalSuccessMessage("document-uploaded")).toBe(
      "Your document was uploaded successfully.",
    );
    expect(getPortalErrorMessage("invalid-tax-year")).toBe(
      "Choose one of the available tax years.",
    );
    expect(getAdminSuccessMessage("return-uploaded")).toBe(
      "The completed document was uploaded.",
    );
    expect(getAdminErrorMessage("document-not-found")).toBe(
      "The requested document was not found.",
    );
  });

  it("does not reflect unknown result codes into the page", () => {
    expect(getPortalErrorMessage("<script>alert(1)</script>")).toBe(
      "The action could not be completed.",
    );
    expect(getAdminSuccessMessage("unknown")).toBe(
      "The action completed successfully.",
    );
  });

  it("returns no message when no code is present", () => {
    expect(getPortalSuccessMessage(undefined)).toBeUndefined();
    expect(getAdminErrorMessage(undefined)).toBeUndefined();
  });
});
