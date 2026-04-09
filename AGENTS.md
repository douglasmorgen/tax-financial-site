# Agent Instructions

When making code changes in this repository, always verify the project can build before handing work back.

## Required Checks

Run these commands after edits:

```bash
npm run lint
npm run build
```

## Deploy-Safety Check (When touching deploy, Prisma, env vars, or API code)

Also run:

```bash
npm run vercel-build
```

This mirrors Vercel's build path (`prisma migrate deploy && next build`) and catches type/build issues before push.

## Reporting

- If checks pass, explicitly say they passed.
- If a check fails, include the exact failing command and error summary.
