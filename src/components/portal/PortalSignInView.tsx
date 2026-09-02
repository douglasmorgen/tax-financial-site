import { SignIn } from "@clerk/nextjs";

export function PortalSignInView() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Secure Client Portal</p>
          <h1 className="mt-4 text-5xl font-semibold text-slate-900">Sign in to upload and download tax documents</h1>
          <p className="mt-4 text-base text-slate-600">
            Create an account if you are new, then use the portal to share source documents and download completed documents.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <SignIn
            path="/portal/login"
            routing="path"
            forceRedirectUrl="/portal"
            signUpUrl="/portal/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
