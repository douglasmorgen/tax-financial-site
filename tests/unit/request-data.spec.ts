import { describe, expect, it } from "vitest";
import {
  isObjectRecord,
  isUuid,
  parseInteger,
  readFormFile,
  readFormString,
} from "@/lib/request-data";

describe("form-data readers", () => {
  it("trims string values and reads files", () => {
    const formData = new FormData();
    const file = new File(["document"], "return.pdf", {
      type: "application/pdf",
    });
    formData.set("name", "  Ada Lovelace  ");
    formData.set("file", file);

    expect(readFormString(formData, "name")).toBe("Ada Lovelace");
    expect(readFormFile(formData, "file")).toBe(file);
  });

  it("rejects missing values and values of the wrong kind", () => {
    const formData = new FormData();
    formData.set("name", new File(["Ada"], "name.txt"));
    formData.set("file", "not-a-file");

    expect(readFormString(formData, "missing")).toBeNull();
    expect(readFormString(formData, "name")).toBeNull();
    expect(readFormFile(formData, "missing")).toBeNull();
    expect(readFormFile(formData, "file")).toBeNull();
  });
});

describe("parseInteger", () => {
  it.each([
    ["0", 0],
    ["2026", 2026],
    ["-12", -12],
  ])("parses %s", (input, expected) => {
    expect(parseInteger(input)).toBe(expected);
  });

  it.each([null, "", " 1", "1.5", "1e3", "9007199254740992"])(
    "rejects %s",
    (input) => {
      expect(parseInteger(input)).toBeNull();
    },
  );
});

describe("boundary guards", () => {
  it("recognizes plain object records", () => {
    expect(isObjectRecord({ value: 1 })).toBe(true);
    expect(isObjectRecord(Object.create(null))).toBe(true);
    expect(isObjectRecord(null)).toBe(false);
    expect(isObjectRecord([])).toBe(false);
  });

  it("accepts RFC 4122-style UUIDs and rejects malformed IDs", () => {
    expect(isUuid("3d594650-3436-4b0d-a2fd-1f2efc7859bd")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("3d594650-3436-0b0d-a2fd-1f2efc7859bd")).toBe(false);
  });
});
