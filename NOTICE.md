# Repository History Notice

**On 2026-05-11 the `main` branch history was rewritten** to redact accidental
IP exposure (backend hostname + dispatch endpoints) from two earlier commits.

## What was redacted

The following strings were replaced with `[REDACTED-*]` placeholders across
all commits where they appeared:

- `api.arxyne.com` → `[REDACTED-BACKEND-HOST]`
- `/api/templates`, `/api/assess`, `/api/results` → `[REDACTED-ENDPOINT]`
- `/api/* → Spark backend` → `[REDACTED-BACKEND-COMMENT]`

Affected commits (now rewritten with new SHAs):

| Old SHA   | New SHA   | Title |
|-----------|-----------|-------|
| `c7ef367` | `6926ddc` | Consent-gate GA4 + add privacy & cookie pages |
| `2fe07cc` | `1abed6e` | Replace /try/ stub with brand-matched coming-soon |
| `e86c2ad` | `e2b9677` | Reduce email exposure + slim privacy 'Your rights' |

## What you need to do if you have a clone

Re-clone or hard-reset:

```bash
git fetch origin
git reset --hard origin/main
```

Pre-existing branches that share the rewritten commits will need to be rebased
or recreated from the new history.

## Why we did it

The `/try/` stub was a work-in-progress for the upcoming interactive demo
that named the backend hostname and dispatch surface in client-side code.
The live site was cleaned within minutes (replaced with a coming-soon page),
but the strings remained in `git log -p` output. That's an architecture leak
on a public repo, so we rewrote history to remove them.

GitHub caches unreachable commits for ~90 days. After that window the old
SHAs return 404 entirely.
