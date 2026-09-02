# Security Policy

## Reporting a vulnerability

Please do not disclose suspected vulnerabilities in a public issue. Contact the repository owner privately with:

- A description of the issue and its potential impact
- The affected route, component, or dependency
- Reproduction steps or a proof of concept
- Any suggested mitigation

Do not access, download, change, or retain real client data while investigating. Allow time for the report to be reviewed and remediated before any public disclosure.

## Sensitive data

This repository must not contain client documents, database exports, access tokens, credentials, `.env` files, or private keys. If a secret is committed, revoke or rotate it immediately; deleting it in a later commit is not sufficient.
