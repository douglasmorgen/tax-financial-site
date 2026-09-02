# Tax & Financial Planning

[Live site: finance.dougmorgen.com](https://finance.dougmorgen.com)

[![CI](https://github.com/douglasmorgen/tax-financial-site/actions/workflows/ci.yml/badge.svg)](https://github.com/douglasmorgen/tax-financial-site/actions/workflows/ci.yml)

A production-minded full-stack TypeScript application for a tax and financial planning practice, with explicit boundaries from the public website to client authentication, PostgreSQL, private document storage, and deployment. It lets prospective clients contact the practice, lets existing clients submit the records needed to prepare their taxes, and gives the tax preparer a private dashboard for reviewing those records and returning completed tax documents.

The application coordinates intake and document delivery; it does not calculate or electronically file tax returns.

## What the application does

### Public website

Visitors can:

- Read about tax planning, investment planning, equity compensation, and cap-table services.
- Review an annual tax-preparation checklist covering income, deductions, credits, estimated payments, and medical expenses.
- Submit a contact request. The server validates the request with reCAPTCHA, stores the message, creates or updates a lead, and optionally sends notification and confirmation emails through Resend.
- Open the client sign-up or sign-in flow.

### Client portal

After signing in with Clerk, a client can:

- Create a local client record automatically on their first portal visit.
- Maintain their name, mailing address, and phone number.
- Upload tax source documents—such as W-2s, 1099s, brokerage statements, prior returns, identification, and IRS notices—tagged by tax year, category, and optional institution.
- Upload PDFs and common image formats up to 25 MiB. Files are kept in private S3-compatible storage rather than exposed as public assets.
- Filter, view, download, and delete documents associated with their own account.
- Receive, view, and download completed federal/state returns, signature pages, filing instructions, authorization forms, extensions, and payment vouchers uploaded by the preparer.

### Administrative workflow

The password-protected `/admin` dashboard lets the tax preparer:

- Review recent contact messages and captured leads.
- See every client profile and the documents belonging to that client.
- View, download, or delete client uploads and previously delivered documents.
- Upload a completed document to a specific client, tax year, and return type, including the relevant state where required.
- Make the uploaded document immediately available in that client's portal.

### Typical end-to-end flow

1. A visitor submits the contact form or signs up directly.
2. Clerk authenticates the client, and the application creates their PostgreSQL client record.
3. The client completes their profile and uploads categorized tax records.
4. The preparer reviews those records from the admin dashboard and prepares the return outside this application.
5. The preparer uploads the finished return package.
6. The client signs back in to securely view or download the completed documents.

PostgreSQL stores clients, leads, messages, and document metadata. The actual document bytes live in private S3-compatible object storage, and every client file request is authorized by account ownership before the object is retrieved.

## Stack

- [Next.js](https://nextjs.org/) 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4
- [Clerk](https://clerk.com/) 7 for client authentication
- [Prisma](https://www.prisma.io/) 7 with its canonical `pg` adapter for PostgreSQL
- AWS SDK for S3 or S3-compatible storage
- Google reCAPTCHA v3 and Resend
- [Vitest](https://vitest.dev/) 4 with V8 coverage for unit and boundary tests

## Repository layout

```text
.
├── src/
│   ├── app/                 # Pages, layouts, and server route handlers
│   ├── components/          # Public, portal, and admin React components
│   ├── generated/prisma/    # Generated Prisma Client; ignored by Git
│   ├── lib/                 # Auth, validation, document, storage, and database logic
│   ├── types/               # Environment and process-level type declarations
│   └── proxy.ts             # Clerk and administrator request boundaries
├── prisma/
│   ├── migrations/          # Committed PostgreSQL schema history
│   └── schema.prisma        # Application data model
├── tests/unit/              # Vitest domain and integration-boundary specs
├── docs/ARCHITECTURE.md     # Architecture decisions, flows, and tradeoffs
├── .kamal/*.example         # Safe templates for ignored local deployment files
├── config/deploy.yml        # Value-free Kamal deployment and PostgreSQL accessory
├── prisma.config.ts         # Prisma CLI and datasource configuration
├── vitest.config.ts         # Test discovery and coverage thresholds
├── Dockerfile               # Node 24 multi-stage production image
└── package.json             # npm scripts and dependency contract
```

## Local setup

### Prerequisites

- Node.js 24.11.0 for local development and CI; Docker tracks the Node.js 24 image line
- npm
- PostgreSQL
- A Clerk application
- A private S3-compatible bucket
- Google reCAPTCHA v3 keys if the contact form will be used

### Install and configure

```bash
git clone git@github.com:douglasmorgen/tax-financial-site.git
cd tax-financial-site
cp .env.example .env
npm ci
```

Fill in `.env`, then prepare the database and start the development server:

- Create a PostgreSQL database and replace `DATABASE_URL` with its connection string. `npm ci` runs Prisma Client generation, but it does not apply migrations.
- Create a Clerk application and set its publishable and secret keys. The tracked redirect configuration keeps sign-in and sign-up under `/portal`; allow `http://localhost:3000` in the Clerk development instance.
- Create a private S3 or S3-compatible bucket. Its credentials need permission to put, get, and delete objects. Set `STORAGE_ENDPOINT` and `STORAGE_FORCE_PATH_STYLE` only when the provider requires them; configure KMS permissions as well when using `STORAGE_KMS_KEY_ID`.
- Create separate reCAPTCHA v3 keys for local development and production. The contact form is unavailable without the public site key and rejects submissions without a working secret key.
- Replace the example administrator credentials with long, unique values. `/admin` and every `/api/admin/*` route use these values for HTTP Basic Auth.
- Add `RESEND_API_KEY` only when contact notification and confirmation email should be delivered. Contact messages and leads are still stored when Resend is not configured.

```bash
npx prisma migrate deploy
npm run dev
```

The application runs at <http://localhost:3000>. The development server, database, Clerk, object storage, and reCAPTCHA are separate services; this repository does not start local substitutes for them.

## Environment variables

The complete, non-secret template is in [`.env.example`](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk browser publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk server secret |
| `ADMIN_USER`, `ADMIN_PASS` | Yes | HTTP Basic Auth credentials for `/admin` and `/api/admin/*` |
| `STORAGE_BUCKET`, `STORAGE_REGION` | Yes | Private object-storage location |
| `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | Yes | Object-storage credentials |
| `STORAGE_ENDPOINT` | Provider-specific | Endpoint for R2, MinIO, and other S3-compatible providers |
| `STORAGE_FORCE_PATH_STYLE` | No | Set to `true` for providers that require path-style URLs |
| `STORAGE_KMS_KEY_ID` | No | Enables SSE-KMS when uploading documents |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | For contact form | reCAPTCHA v3 client and server keys |
| `RESEND_API_KEY` | No | Sends contact notifications; submissions are still stored without it |
| `CLERK_PROXY_URL`, `CLERK_AUTHORIZED_PARTIES` | No | Clerk proxy and origin hardening for proxied deployments |

Clerk redirect variables in the example keep sign-in and sign-up inside `/portal`.

## Routes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Tax, financial, equity-compensation, and investment-planning overview |
| `GET` | `/contact` | Public | Contact form backed by reCAPTCHA, PostgreSQL, and optional Resend email |
| `GET` | `/tax-appointment-checklist` | Public | Annual tax-record preparation checklist |
| `GET` | `/portal/login`, `/portal/sign-up` | Public | Clerk client authentication and registration |
| `GET` | `/portal` | Clerk client | Profile, source-document uploads, and completed-document delivery |
| `GET` | `/admin` | Basic Auth | Leads, messages, clients, source files, and completed-return administration |
| `POST` | `/api/contact` | Public + reCAPTCHA | Validate and store a message, upsert its lead, and schedule optional email |
| `POST` | `/api/client/profile` | Clerk client | Update the authenticated client's profile |
| `POST` | `/api/client/documents` | Clerk client | Validate and upload a categorized source document |
| `GET` | `/api/client/documents/[id]/view` | Owning client | Stream a private document inline |
| `GET` | `/api/client/documents/[id]/download` | Owning client | Download a private document as an attachment |
| `POST` | `/api/client/documents/[id]/delete` | Owning client | Delete the storage object and its metadata |
| `GET` | `/api/admin/contact-messages`, `/api/admin/leads` | Basic Auth | Return recent intake records as JSON |
| `POST` | `/api/admin/documents` | Basic Auth | Deliver a completed document to a selected client |
| `GET` | `/api/admin/documents/[id]/view` | Basic Auth | Stream any client document inline |
| `GET` | `/api/admin/documents/[id]/download` | Basic Auth | Download any client document |
| `POST` | `/api/admin/documents/[id]/delete` | Basic Auth | Delete any client document and its metadata |

## Useful commands

```bash
npm run dev             # local development
npm run prisma:generate # regenerate the typed Prisma client
npm run lint            # ESLint checks
npm run typecheck       # generate route types and run strict TypeScript
npm test                # run the Vitest suite once
npm run test:watch      # run Vitest in watch mode
npm run test:coverage   # enforce coverage thresholds and write HTML/LCOV reports
npm run check           # lint, type-check, test, and production build
npm run build           # production Next.js build
npm run start           # serve a completed build
npm run vercel-build    # deploy migrations, then build as Vercel does
```

## Type-safety and testing baseline

The project is TypeScript-only application code. Its compiler configuration enables strict mode together with unchecked-index protection, exact optional properties, implicit-return checking, unused-code checks, side-effect import checking, and generated Next.js route types. Environment variables have an explicit `ProcessEnv` contract, and Prisma generates model and enum types from the committed schema.

HTTP bodies, form fields, route parameters, environment variables, and provider responses are treated as untrusted values. Reusable parsers and guards in `src/lib` narrow them before they reach database or storage operations. Client-facing document queries include the authenticated client ID, so possession of another document UUID is not sufficient for access.

Vitest covers validation, tax-year and document rules, stored filenames, response parsing, security encoding, reCAPTCHA responses, and user-facing action messages. V8 coverage is enforced at 90% for statements, branches, functions, and lines. GitHub Actions performs a clean install, lint, strict type check, coverage run, and production build for pushes and pull requests.

`npm run check` is the local quality gate. The Vercel build adds migration deployment before the same production build; the Docker builder performs the production build inside the Node 24 image.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system context, data model, request flows, security boundaries, tradeoffs, and evolution guidelines.

Repository-wide development rules for coding agents are in [AGENTS.md](AGENTS.md).

## Production shape

The application ships as one Next.js server. Server Components render database-backed portal and admin pages, route handlers own mutations and private file responses, and Client Components are limited to interactive forms and portal controls. PostgreSQL stores structured records and S3 stores document bytes; browsers never receive database credentials, storage credentials, or direct private-object URLs.

Clerk protects the client portal and client API. A signed-in Clerk identity is mapped to one local client by normalized primary email, and the local record is created on first portal access. `src/proxy.ts` separately protects the complete administrator page and API namespace with HTTP Basic Auth.

Uploads are buffered by the application, limited to 25 MiB, and restricted to PDF, JPEG, PNG, WebP, and HEIC MIME types. The application generates opaque, client-scoped storage keys. Views and downloads are streamed through authorized route handlers with private, no-store response headers. Optional `STORAGE_KMS_KEY_ID` configuration requests AWS KMS encryption on upload.

Contact submissions are accepted only after Google reports a successful reCAPTCHA verification. PostgreSQL stores the message and lead in one transaction. If Resend is configured, notification and confirmation messages run after the HTTP response; email failure does not discard the stored submission.

### Vercel

1. Import the GitHub repository into Vercel.
2. Add the variables from `.env.example` under **Project Settings → Environment Variables**.
3. Use the default install command. The `postinstall` script generates Prisma Client.
4. Set the build command to `npm run vercel-build` so production migrations run before the production build.
5. Verify sign-up, sign-in, document upload/download, contact submission, and admin authentication after deployment.

The deployment database must be reachable from Vercel's build environment, and its deployment user must be allowed to run the committed Prisma migrations. A failed migration aborts `npm run vercel-build` before the application build.

### Docker / Kamal

The multi-stage `Dockerfile` builds and runs the application with Node.js 24 on port `3000`. Development dependencies stay in the builder stage; the final image contains production dependencies, the compiled Next.js output, configuration, and committed Prisma migrations.

Docker BuildKit secrets supply Clerk and reCAPTCHA public build-time values without copying local environment files into the image. The placeholder database URL used by the builder exists only so Prisma can generate its client and Next.js can compile. Runtime database and provider credentials remain external secrets.

`config/deploy.yml` deploys the image with Kamal, publishes it to a loopback-only host port, and defines a persistent PostgreSQL 16 accessory. The tracked file contains no machine-specific coordinates: it loads them from ignored `.kamal/deploy.env`. Reverse-proxy and public TLS configuration are intentionally outside this repository.

Unlike the Vercel build, the Docker container currently starts `next start` directly and does not apply migrations on boot. Apply `prisma migrate deploy` from a trusted release environment before deploying a schema-dependent image. If that migration fails, do not release the new container.

For a new checkout, create the ignored local deployment files from the safe templates:

```bash
cp .kamal/deploy.env.example .kamal/deploy.env
cp .kamal/secrets.example .kamal/secrets
chmod 600 .kamal/deploy.env .kamal/secrets
```

Replace every placeholder before using Kamal. `.kamal/deploy.env` owns the host, SSH, port, registry namespace, database coordinates, and application URL. `.kamal/secrets` owns credentials and provider values. Neither local file belongs in Git or the Docker build context.

There is no GitHub Actions deployment workflow; CI verifies the repository but does not publish or deploy it.

## Public repository rule

Use synthetic data only. This application handles tax records and other sensitive financial documents, so never commit credentials, client information, uploaded files, database exports, certificates, or provider configuration containing secrets. Keep the bucket private, use least-privilege database and storage identities, and configure encryption, access logs, retention, backups, recovery, and key rotation at the provider level.

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.
