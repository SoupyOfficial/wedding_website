# Decision: Provider Pattern (Storage + Email)

## Choice: Factory + registry pattern for swappable storage and email backends

### Why

- **Deployment flexibility**: Local filesystem storage works for dev, Cloudinary for production. The site should work with either without code changes.
- **Email is optional**: Not all deployments need email. A no-op provider logs to console instead of failing.
- **Testing**: Mock providers can be registered at runtime via `registerProvider()`.

### How It Works

```
lib/providers/
  index.ts              ← Factory: createStorageProvider() + getProvider()/registerProvider()
  storage/
    storage.provider.ts  ← IStorageProvider interface (upload, delete, getUrl, list)
    local.storage.ts     ← Writes to public/uploads/, returns relative URLs
    cloudinary.storage.ts← Cloudinary SDK upload with transforms
  email/
    email.provider.ts    ← IEmailProvider interface (send, sendBatch, isConfigured)
    noop.email.ts        ← Console logger stub
```

Factory reads `STORAGE_PROVIDER` env var:
- `"cloudinary"` → CloudinaryStorageProvider (needs CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
- anything else → LocalStorageProvider (writes to filesystem)

### Tradeoffs Accepted

- **No email provider beyond noop**: There's an interface but no real implementation (Resend, SendGrid, etc). Email campaigns exist in the schema but can't actually send.
- **Local storage breaks on Vercel**: The local provider checks filesystem writability in its constructor and throws if read-only. This is caught at runtime, not build time.
- **Provider registry is global mutable state**: `registerProvider()` mutates a module-level Map. Fine for a single-admin site, but not safe for multi-tenant.

### Simplification Candidates

- If Cloudinary is always used in production, the local storage provider + factory switch may be unnecessary complexity.
- The email provider system (interface + noop + campaign models) is unused infrastructure. If mass email is not planned, this could be removed entirely.
- The registry pattern (`getProvider`/`registerProvider`) is only used for storage. Direct imports would be simpler.
