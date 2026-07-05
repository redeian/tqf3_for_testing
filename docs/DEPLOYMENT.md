# Deployment Guide

> **For AI Agents:** Read this before modifying deployment configuration or deploying to production.

## 1. Architecture

```
Internet → Caddy (HTTPS:443) → Next.js App (:3000) → MySQL (:3306)
```

All three services run on a single VPS via Docker Compose.

## 2. Prerequisites

### Server Requirements
- **VPS**: Any Linux server (Ubuntu 22.04+ recommended)
- **Minimum specs**: 2 vCPU, 4GB RAM, 40GB SSD
- **Recommended**: Hetzner CX22 (~$4.50/month) or DigitalOcean Droplet ($12/month)
- **Docker** and **Docker Compose** installed on server
- **Domain name** pointing to the server's IP address

### GitHub Repository Settings
- Repository must be connected to GitHub Actions
- The following secrets must be set in GitHub → Settings → Secrets and Variables → Actions:

| Secret Name | Purpose |
|-------------|---------|
| `SSH_HOST` | Server IP address or domain |
| `SSH_USER` | SSH username (e.g., `deploy`) |
| `SSH_KEY` | Private SSH key for deployment |
| `DB_ROOT_PASSWORD` | MySQL root password (production) |
| `DB_PASSWORD` | MySQL app user password (production) |
| `AUTH_SECRET` | Auth.js secret (generate with `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID (production) |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret (production) |
| `NEXTAUTH_URL` | Production URL (e.g., `https://syllabus.yourdomain.com`) |

### Google OAuth Production Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
3. Keep the local redirect URI for development: `http://localhost:3000/api/auth/callback/google`

## 3. Docker Configuration

### Dockerfile (Production)
Located at project root. Multi-stage build:

```dockerfile
# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Important:** `output: "standalone"` must be set in `next.config.ts` for this to work.

### docker-compose.prod.yml
Located at project root:

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://appuser:${DB_PASSWORD}@db:3306/syllabus_db
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
      - AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: syllabus_db
      MYSQL_USER: appuser
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  caddy:
    image: caddy:2-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app

volumes:
  mysql_data:
  caddy_data:
  caddy_config:
```

### Caddyfile
Located at project root. Caddy automatically obtains and renews HTTPS certificates:

```caddyfile
{$DOMAIN} {
    reverse_proxy app:3000
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

> Replace `{$DOMAIN}` with your actual domain, or pass `DOMAIN` as an environment variable.

## 4. CI/CD Pipeline (GitHub Actions)

### Workflow: `.github/workflows/ci.yml`
Runs on every push and PR:

1. **Lint** — `npm run lint`
2. **Type Check** — `npx tsc --noEmit`
3. **Unit Tests** — `npm test`
4. **Build** — `npm run build`

### Workflow: `.github/workflows/deploy.yml`
Runs on merge to `main` (after CI passes):

1. SSH into the production server
2. Pull latest code
3. Run database migrations (`npm run db:migrate`)
4. Rebuild Docker images (`docker-compose -f docker-compose.prod.yml build`)
5. Restart containers (`docker-compose -f docker-compose.prod.yml up -d`)
6. Health check (curl the app URL)

### GitHub Actions Free Tier Limits
- **Private repos**: 2,000 minutes/month (Free plan)
- **Public repos**: Unlimited minutes
- **Artifact storage**: 500 MB (Free plan)
- **Self-hosted runners**: Free (install on your own server for unlimited minutes)
- **Estimated usage**: ~50-100 minutes/month for this project (well within free tier)

## 5. First-Time Server Setup

```bash
# 1. SSH into your server
ssh deploy@your-server-ip

# 2. Clone the repository
git clone https://github.com/your-org/syllabus-system.git
cd syllabus-system

# 3. Create production .env file
cp .env.example .env.production
# Edit .env.production with real values:
#   DB_ROOT_PASSWORD=<strong-password>
#   DB_PASSWORD=<strong-password>
#   AUTH_SECRET=<openssl-rand-base64-32>
#   AUTH_GOOGLE_ID=<your-production-client-id>
#   AUTH_GOOGLE_SECRET=<your-production-client-secret>
#   NEXTAUTH_URL=https://yourdomain.com
#   DOMAIN=yourdomain.com

# 4. Run database migrations
npm install
npm run db:generate
npm run db:migrate

# 5. Start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 6. Verify
curl https://yourdomain.com
```

## 6. Database Backup Strategy

### Manual Backup
```bash
docker exec syllabus_db mysqldump -u root -p${DB_ROOT_PASSWORD} syllabus_db > backup_$(date +%Y%m%d).sql
```

### Automated Backup (Cron)
Add to server crontab (`crontab -e`):
```bash
# Daily backup at 3 AM
0 3 * * * docker exec syllabus_db mysqldump -u root -p$DB_ROOT_PASSWORD syllabus_db | gzip > /backups/syllabus_$(date +\%Y\%m\%d).sql.gz
```

> **Future enhancement:** Set up automated off-site backup to S3 or similar.

## 7. Monitoring

### Health Check
```bash
# Check if app is running
docker-compose -f docker-compose.prod.yml ps

# Check app logs
docker-compose -f docker-compose.prod.yml logs app --tail 50

# Check database logs
docker-compose -f docker-compose.prod.yml logs db --tail 50

# Check Caddy logs (HTTPS cert issues)
docker-compose -f docker-compose.prod.yml logs caddy --tail 50
```

### Rollback
```bash
# Go back to previous commit
git log --oneline -5
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

## 8. Environment Variables Reference

### Development (`.env.local`)
```env
DATABASE_URL=mysql://root:root@127.0.0.1:3306/syllabus_db
AUTH_SECRET=dev-secret-not-for-production
AUTH_GOOGLE_ID=your-dev-google-client-id
AUTH_GOOGLE_SECRET=your-dev-google-client-secret
AUTH_TRUST_HOST=true
```

### Production (`.env.production` — never committed)
```env
DATABASE_URL=mysql://appuser:STRONG_PASSWORD@db:3306/syllabus_db
DB_ROOT_PASSWORD=STRONG_ROOT_PASSWORD
DB_PASSWORD=STRONG_APP_PASSWORD
AUTH_SECRET=GENERATED_WITH_OPENSSL_RAND_BASE64_32
AUTH_GOOGLE_ID=production-google-client-id
AUTH_GOOGLE_SECRET=production-google-client-secret
NEXTAUTH_URL=https://yourdomain.com
DOMAIN=yourdomain.com
NODE_ENV=production
```

### Template (`.env.example` — committed to Git)
See the file at project root. Contains all keys with dummy values.