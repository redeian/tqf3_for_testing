---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Sequence Diagram: Auth Flow (Google OAuth)

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant P as proxy.ts
    participant A as Auth.js (Server)
    participant G as Google OAuth
    participant DB as MySQL (Drizzle)

    U->>B: Visits /dashboard
    B->>P: GET /dashboard
    P->>P: Check session cookie
    P-->>B: No session → Redirect to /login
    B-->>U: Shows login page with Google button

    U->>B: Clicks "Sign in with Google"
    B->>A: POST /api/auth/signin/google
    A-->>B: Redirect to Google consent URL
    B->>G: Redirect to accounts.google.com
    G-->>U: Shows consent screen
    U->>G: Grants permission
    G-->>B: Redirect to /api/auth/callback/google?code=xxx
    B->>A: GET /api/auth/callback/google?code=xxx

    A->>G: Exchange code for user profile
    G-->>A: Returns user info (name, email, picture)

    A->>DB: SELECT user WHERE email = ?
    DB-->>A: User not found

    A->>DB: INSERT INTO users (id, name, email, image)
    DB-->>A: User created

    A->>DB: INSERT INTO accounts (provider='google', ...)
    DB-->>A: Account linked

    A->>DB: INSERT INTO sessions (userId, expires)
    DB-->>A: Session created

    A-->>B: Set session cookie + redirect to /dashboard
    B->>P: GET /dashboard (with session cookie)
    P->>P: Verify session cookie
    P->>A: Check session validity
    A->>DB: SELECT session WHERE token = ?
    DB-->>A: Valid session
    A-->>P: Session valid, user = {name, email}
    P-->>B: Allow access, render dashboard
    B-->>U: Shows dashboard
```

## Notes

- Auth.js v5 handles the entire OAuth flow — no custom code needed beyond config
- The Drizzle adapter automatically manages users, accounts, and sessions tables
- `proxy.ts` runs on every request to protected routes, checking the session cookie
- Session expires after 30 days (configurable in Auth.js config)
- If session is invalid, user is silently redirected to login