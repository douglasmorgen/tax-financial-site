import { afterEach, describe, expect, it, vi } from "vitest";
import { validateRecaptcha } from "@/lib/recaptcha";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("validateRecaptcha", () => {
  it("rejects a missing browser token without calling Google", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateRecaptcha(undefined)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the token and accepts an explicit successful response", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "server-secret");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateRecaptcha("browser-token")).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.google.com/recaptcha/api/siteverify",
      expect.objectContaining({ method: "POST" }),
    );

    const requestBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(requestBody).toBeInstanceOf(URLSearchParams);
    expect(String(requestBody)).toBe(
      "secret=server-secret&response=browser-token",
    );
  });

  it.each([
    new Response("upstream error", { status: 502 }),
    new Response(JSON.stringify({ success: false })),
    new Response(JSON.stringify({ success: "true" })),
  ])("rejects unsuccessful or malformed responses", async (response) => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "server-secret");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    await expect(validateRecaptcha("browser-token")).resolves.toBe(false);
  });

  it("fails closed when the verification request throws", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "server-secret");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("network unavailable")),
    );

    await expect(validateRecaptcha("browser-token")).resolves.toBe(false);
  });
});
