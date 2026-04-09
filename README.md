# Tax Financial Site

Next.js client portal for tax document uploads, finished-return delivery, and admin workflows.

## Deploy To Vercel

This project is configured for Vercel deployment. The app uses Prisma + Postgres, Clerk auth, S3-compatible object storage, optional reCAPTCHA, and optional Resend email.

### 1. Prerequisites

- A Vercel account
- A Postgres database (Neon/Supabase/RDS/etc.)
- A Clerk application
- An S3-compatible storage bucket and credentials
- Optional: Google reCAPTCHA keys
- Optional: Resend API key

### 2. Create The Vercel Project

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, click `Add New -> Project`.
3. Import the repository.
4. Keep Framework Preset as `Next.js`.

### 3. Set Environment Variables

Add these in Vercel under `Project Settings -> Environment Variables`.

Required:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `ADMIN_USER`
- `ADMIN_PASS`

Usually required for Clerk redirect/callback correctness:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (example: `/portal/login`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (example: `/portal/sign-up`)
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (example: `/portal`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (example: `/portal`)

Optional:

- `STORAGE_ENDPOINT` (required for non-AWS S3 providers)
- `STORAGE_FORCE_PATH_STYLE` (`true` for some S3-compatible providers)
- `STORAGE_KMS_KEY_ID` (if using SSE-KMS)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `RESEND_API_KEY`

### 4. Build And Database Migrations

`package.json` includes:

- `postinstall`: `prisma generate`
- `vercel-build`: `prisma migrate deploy && next build`

So each deployment runs Prisma migrations before building.

### 5. Deploy

Trigger deploy from Vercel (or push to your production branch if auto-deploy is enabled).

### 6. Post-Deploy Verification

Check the following in production:

- Home page loads
- `/portal/sign-up` and `/portal/login` render Clerk UI
- A client can upload a document
- Admin page is protected by basic auth (`ADMIN_USER`/`ADMIN_PASS`)
- Admin can upload a finished return
- Client can download finished returns

### 7. Troubleshooting

- `Missing storage configuration`: one or more `STORAGE_*` vars are missing.
- Clerk auth loops or bad redirects: verify Clerk publishable/secret keys and Clerk redirect env vars.
- Prisma errors during build: verify `DATABASE_URL` points to reachable Postgres and migration permissions are correct.
- Contact form reCAPTCHA failures: verify both `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`.

## Local Development On macOS

### 1. Install Prerequisites

Install Homebrew (if needed):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install Git, Node.js, and Postgres:

```bash
brew install git node@22 postgresql@16
```

Start Postgres and enable auto-start:

```bash
brew services start postgresql@16
```

Confirm versions:

```bash
node -v
npm -v
psql --version
```

Note: this repo pins Node to `22.13.1` in `.tool-versions`.

### 2. Clone And Install Dependencies

```bash
git clone <your-repo-url>
cd tax-financial-site
npm install
```

### 3. Create Local Database

```bash
createdb tax_financial_app
```

If `createdb` is not found, make sure Postgres is on your `PATH`:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Configure Environment Variables

Create `.env` in project root:

```bash
cp .env .env.local.backup 2>/dev/null || true
```

Then set at least:

```dotenv
DATABASE_URL="postgresql://<db-user>@localhost:5432/tax_financial_app"
ADMIN_USER="admin"
ADMIN_PASS="choose-a-strong-password"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."

STORAGE_BUCKET="..."
STORAGE_REGION="..."
STORAGE_ACCESS_KEY_ID="..."
STORAGE_SECRET_ACCESS_KEY="..."
STORAGE_ENDPOINT="..." # required for non-AWS S3 providers
STORAGE_FORCE_PATH_STYLE="false"
```

Optional:

```dotenv
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."
RESEND_API_KEY="..."
```

### 5. Run Prisma Migrations

```bash
npx prisma migrate deploy
```

If this is a fresh local DB and you need to create migrations during development:

```bash
npx prisma migrate dev
```

### 6. Start The App

```bash
npm run dev
```

Open `http://localhost:3000`.

### 7. Smoke Test Checklist

- `http://localhost:3000` loads
- `http://localhost:3000/admin` prompts for basic auth
- `http://localhost:3000/portal/sign-up` and `/portal/login` show Clerk
- Uploading/downloading documents works (requires valid storage creds)

### 8. Common Local Issues

- `Missing storage configuration`: missing `STORAGE_*` values.
- `P1001`/database connection errors: Postgres not running or bad `DATABASE_URL`.
- Clerk page errors: missing Clerk keys.
- Uploads fail: invalid S3/R2 credentials, endpoint, or bucket.
