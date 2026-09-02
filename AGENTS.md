# Agent Instructions

These instructions apply to the entire repository. Read `README.md` and `docs/ARCHITECTURE.md` before making architectural or deployment changes.

## Working Agreement

- Preserve existing user changes and keep edits scoped to the request.
- Do not create commits, push branches, or change Git remotes unless the user explicitly asks.
- Do not deploy, stop or restart remote applications, run remote commands, or mutate retained databases, storage, DNS, or provider configuration unless the user explicitly asks for that external action.
- Prefer the smallest conventional implementation that satisfies the request. Do not add speculative infrastructure or compatibility hacks, and explain meaningful tradeoffs.
- Fix root causes instead of adding placeholder artifacts or compatibility shims. Do not add `.gitkeep`, dummy files, empty assets, no-op scripts, or similar workarounds solely to satisfy a build or deployment assumption. Remove or correct the stale build or configuration reference instead.
- Before deleting the final tracked file from a directory, search Dockerfiles, CI workflows, deployment configuration, scripts, and application code for references to that directory, then run the affected deployment build.
- Start by inspecting `git status` and the relevant source, tests, contracts, schema, scripts, and configuration. Do not overwrite, restore, stage, or absorb unrelated worktree changes.
- Treat the established GitHub-to-Vercel and Docker/Kamal paths as compatibility contracts. General cleanup does not authorize changes to the Dockerfile, package build/install scripts, Vercel behavior, or Kamal configuration; change them only when the task requires it.
- Use the existing npm toolchain and committed `package-lock.json`.
- Keep credentials, client data, database exports, certificates, and local environment files out of Git and Docker contexts.
- Do not read or print values from ignored credential files merely to make a check pass. Inspect only required key names or presence, use synthetic values for local verification, and report missing configuration without exposing existing secrets.

## TypeScript Standards

- All application source must be TypeScript or TSX and pass the strict options in `tsconfig.json`.
- Treat request bodies, form data, URL parameters, environment variables, and third-party JSON as untrusted input. Parse and narrow them before use.
- Do not use `any`, `@ts-ignore`, non-null assertions, or unchecked type assertions. If an assertion is unavoidable at an integration boundary, isolate it behind a documented type guard.
- Prefer discriminated unions, literal tuples, type predicates, `satisfies`, and exhaustive checks over broad strings or records.
- Use `import type` for type-only imports.
- Give exported domain and integration functions explicit parameter and return types.
- Keep nullable database values explicit; do not silently coerce `null` and `undefined` unless the boundary requires it.
- Add a reusable parser or guard when the same input rule appears in more than one route.

## Next.js and React Standards

- Use Server Components by default. Add `"use client"` only when browser state, effects, event handlers, or client-only SDKs require it.
- Keep secrets and privileged SDKs in server-only modules.
- Enforce authorization before database or object-storage access. Client document queries must include the authenticated client ID.
- Keep route handlers focused on authentication, input parsing, orchestration, and response mapping. Put reusable domain and integration logic in `src/lib`.
- Use typed routes and Next.js App Router conventions. Prefer `next/link` for internal navigation.
- Avoid unnecessary effects and memoization; derive values during render when inexpensive.
- Preserve accessible labels, button states, and semantic HTML when changing UI code.

## Data, Storage, and Integrations

- Commit a Prisma migration for every schema change. Do not use `db push` as a replacement for migrations.
- Upgrade Prisma CLI, Client, and the PostgreSQL adapter together within the same supported release line. Follow the current Prisma migration guide instead of preserving deprecated generators or configuration.
- Store document metadata in PostgreSQL and document bytes in private S3-compatible storage.
- Account for partial failure whenever a workflow writes to both PostgreSQL and object storage.
- Never expose storage keys, storage credentials, or direct private-object URLs to the browser.
- Keep optional integrations best-effort unless a durable queue explicitly guarantees delivery.

## Dependency Changes

- Prefer the newest stable version compatible with the framework and its peer dependency ranges; a numerically newer but invalid dependency graph is not acceptable.
- Run `npm audit` after dependency changes.
- Avoid `npm audit fix --force` and unreviewed major upgrades.
- Remove unused direct dependencies.

## Testing Standards

- Use Vitest for unit and integration specs. Name files `*.spec.ts` or `*.spec.tsx` under `tests/`.
- Test observable behavior and trust boundaries instead of implementation details.
- Add a regression spec with every bug fix when the behavior can be exercised deterministically.
- Keep time, network, environment, randomness, and provider responses controlled inside tests.
- Use Playwright for future browser end-to-end coverage; do not force async Server Components into DOM unit-test harnesses.
- Keep the configured coverage floor passing when changing covered domain modules.

## Required Checks

Run after every code or configuration change:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

When touching deployment configuration, Prisma, environment variables, middleware/proxy authorization, or API routes, also run:

```bash
npm run vercel-build
```

Run the deploy-safety command against a disposable or explicitly designated database. It executes `prisma migrate deploy` before the Next.js build.

For Dockerfile, Kamal, container-runtime, or production-dependency changes, also build for the actual deployment platform and smoke-test the final runtime stage. Use synthetic provider values and a disposable database; a successful builder stage alone is not sufficient.

After dependency changes, also run:

```bash
npm audit --audit-level=high
npm ls --depth=0
```

## Reporting

- Explicitly report which checks passed.
- For any failure, include the exact command and a concise error summary.
- Call out any check that used placeholder configuration or a disposable database.
- List unresolved security, migration, or deployment risks before handing work back.
- Inspect `git status`, the final diff, and `git diff --check` before handoff. Report every changed or untracked file and state explicitly whether commits, pushes, deployments, or remote mutations were not performed.
