## Configuration

Set these backend environment variables before starting FastAPI:

```env
DATABASE_URL=your-postgres-connection-string
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_PDF_SIZE_BYTES=10485760
```

`SUPABASE_JWT_SECRET` is the JWT secret from Supabase Project Settings > API. It is used only by the backend to verify Supabase access tokens. Never put it in the frontend environment or expose it to the browser.

`CORS_ORIGINS` is a comma-separated allowlist. `MAX_PDF_SIZE_BYTES` defaults to 10 MiB.

On startup, the API creates missing tables and adds the `papers.user_id` column and index if needed. Existing rows are preserved; rows without an owner are excluded from authenticated users until they are assigned an owner. Note and bookmark foreign-key constraints are added as `NOT VALID` so existing orphan rows are preserved while new writes and future paper deletes use cascade behavior.
