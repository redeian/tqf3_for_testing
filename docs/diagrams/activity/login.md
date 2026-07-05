---
version: 1.0.0
last_updated: 2025-07-05
validated: ✅
---

# Activity Diagram: Login / Authentication

```mermaid
flowchart TD
    Start([User visits app]) --> CheckSession{Has valid\nsession cookie?}
    
    CheckSession -->|Yes| Dashboard[Redirect to /dashboard]
    CheckSession -->|No| LoginPage[Show login page\nwith Google button]
    
    LoginPage --> ClickGoogle[User clicks\n'Sign in with Google']
    ClickGoogle --> GoogleConsent[Redirect to Google\nOAuth consent screen]
    
    GoogleConsent --> UserConsent{User grants\npermission?}
    UserConsent -->|No| LoginPage
    UserConsent -->|Yes| Callback[Google redirects to\n/api/auth/callback/google]
    
    Callback --> CreateSession[Auth.js creates session\nin MySQL database]
    CreateSession --> SetCookie[Set session cookie\nin browser]
    SetCookie --> Dashboard
    
    Dashboard --> CheckRole{Is user\nadmin?}
    CheckRole -->|Yes| AdminDashboard[Show admin dashboard\n(all syllabi visible)]
    CheckRole -->|No| TeacherDashboard[Show teacher dashboard\n(own syllabi only)]
    
    AdminDashboard --> End([End])
    TeacherDashboard --> End
```

## Notes

- Uses Auth.js v5 with Google OAuth provider
- Session is stored in MySQL via Drizzle adapter
- `proxy.ts` checks session cookie on every protected route
- If session expires, user is redirected back to login page
- No password management — Google handles all authentication