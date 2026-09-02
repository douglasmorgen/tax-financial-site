import { isObjectRecord } from "@/lib/request-data";

export async function validateRecaptcha(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("Missing RECAPTCHA_SECRET_KEY");
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    if (!res.ok) {
      return false;
    }

    const data: unknown = await res.json();
    return isObjectRecord(data) && data["success"] === true;
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return false;
  }
}
