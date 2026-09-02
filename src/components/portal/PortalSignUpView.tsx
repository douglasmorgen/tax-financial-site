import { SignUp } from "@clerk/nextjs";

export function PortalSignUpView() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Secure Client Portal</p>
          <h1 className="mt-4 text-5xl font-semibold text-slate-900">Create your client portal account</h1>
          <p className="mt-4 text-base text-slate-600">
            After you sign up, you can immediately upload tax documents and receive completed documents in one place.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <SignUp
            path="/portal/sign-up"
            routing="path"
            forceRedirectUrl="/portal"
            signInUrl="/portal/login"
          />
        </div>
      </div>
    </div>
  );
}
