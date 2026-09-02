export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly ADMIN_PASS?: string;
      readonly ADMIN_USER?: string;
      readonly CLERK_AUTHORIZED_PARTIES?: string;
      readonly CLERK_PROXY_URL?: string;
      readonly CLERK_PUBLISHABLE_KEY?: string;
      readonly CLERK_SECRET_KEY?: string;
      readonly DATABASE_URL?: string;
      readonly NEXT_PUBLIC_CLERK_PROXY_URL?: string;
      readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
      readonly NEXT_PUBLIC_RECAPTCHA_SITE_KEY?: string;
      readonly NODE_ENV: "development" | "production" | "test";
      readonly RECAPTCHA_SECRET_KEY?: string;
      readonly RESEND_API_KEY?: string;
      readonly STORAGE_ACCESS_KEY_ID?: string;
      readonly STORAGE_BUCKET?: string;
      readonly STORAGE_ENDPOINT?: string;
      readonly STORAGE_FORCE_PATH_STYLE?: "true" | "false";
      readonly STORAGE_KMS_KEY_ID?: string;
      readonly STORAGE_REGION?: string;
      readonly STORAGE_SECRET_ACCESS_KEY?: string;
    }
  }
}
