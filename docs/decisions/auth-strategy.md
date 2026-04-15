# Decision: Authentication Strategy

## Choice: NextAuth v5 Credentials provider, admin-only, JWT sessions

### Why

- This is a **single-admin** wedding site. There's one admin (the couple) who manages everything. OAuth/social login adds complexity with zero benefit.
- Credentials provider checks against `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars — no user table needed.
- JWT session strategy means no server-side session store is required (works on edge/serverless).

### How Auth Flows Work

```
Admin login:
  POST /api/auth → NextAuth → Credentials.authorize()
    → compare email + password (bcrypt if hashed, plain if dev)
    → return {id:"admin", email, name:"Admin"} or null

Admin API protection (middleware.ts):
  /api/v1/admin/* → req.auth?.user check → 401 JSON if missing

Admin page protection (auth.ts callback):
  /admin/* (not /admin/login) → redirect to /admin/login if no session
  /admin/login + already logged in → redirect to /admin/dashboard

Site password (middleware.ts):
  Non-admin pages → check "site-password-enabled" cookie
    → if enabled + no "site-access" cookie → redirect /site-password
```

### Tradeoffs Accepted

- **No role system**: Only one admin role exists. If multi-admin is needed, this would need a User model.
- **Plain text dev passwords**: The `authorize()` function supports plain text comparison for local dev. This is guarded by checking if the hash starts with `$2` (bcrypt prefix).
- **Cookie-based site password**: Site-wide password gating uses cookies, not sessions. The password itself is stored in SiteSettings (plaintext comparison). This is intentional — it's a convenience gate, not security-critical auth.

### Simplification Candidates

- The site password system is separate from NextAuth and uses its own cookie logic. This is fine for its purpose but adds a second auth concept to reason about.
- If the wedding is over, the site password gate + RSVP auth are dead code.
