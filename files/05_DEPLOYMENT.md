# CipherLLM — Deployment

---

## 🗺️ Deployment Strategy Overview

CipherLLM has three deployment modes depending on who's using it:

```
┌─────────────────────────────────────────────────────────┐
│  MODE 1 — LOCAL (npm package)                           │
│  Developer installs on their own machine                │
│  Data never leaves their laptop. Zero cloud cost.       │
├─────────────────────────────────────────────────────────┤
│  MODE 2 — SELF-HOSTED (Docker on their server)          │
│  Company runs CipherLLM on their own infrastructure     │
│  Full control. DPDP compliant by design.                │
├─────────────────────────────────────────────────────────┤
│  MODE 3 — CLOUD (Your hosted gateway)                   │
│  You run CipherLLM as a SaaS                            │
│  Companies point their apps at your API endpoint        │
└─────────────────────────────────────────────────────────┘
```

**For your resume and initial launch — deploy Mode 1 and Mode 2 first.**
Mode 3 is a business. Start there after proving the product.

---

## 📦 Mode 1 — npm Package Deployment

### Publishing To npm

```bash
# 1. Build TypeScript to JavaScript
npm run build
# compiles src/ → dist/

# 2. Check what will be published
npm pack --dry-run

# 3. Login and publish
npm login
npm publish --access public

# Users install with:
npm install cipherllm
```

### package.json Setup For Publishing

```json
{
  "name": "cipherllm",
  "version": "1.0.0",
  "description": "Privacy-preserving prompt gateway for LLMs. Redacts PII before it reaches any AI provider.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "keywords": [
    "llm", "privacy", "pii", "aadhaar", "dpdp",
    "openai", "anthropic", "security", "india"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

### Version Strategy

```
1.0.0 → Regex-only MVP
1.1.0 → NLP/NER added
1.2.0 → Dashboard included
2.0.0 → Multi-provider + audit logs
```

---

## 🐳 Mode 2 — Docker / Self-Hosted Deployment

This is the mode enterprises want. They run it on their own server. Data never leaves their infrastructure.

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

# Non-root user for security
RUN addgroup -S cipher && adduser -S cipher -G cipher
USER cipher

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  cipherllm:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MASTER_KEY=${MASTER_KEY}
      - PORT=3000
    volumes:
      - vault_data:/app/vaults      # encrypted vault storage
      - audit_logs:/app/logs        # compliance audit logs
    restart: unless-stopped

  # Phase 2: spaCy NER microservice
  ner_service:
    build: ./ner-service
    ports:
      - "5001:5001"
    restart: unless-stopped

volumes:
  vault_data:
  audit_logs:
```

### Running It

```bash
# Clone and run
git clone https://github.com/your-username/cipherllm
cd cipherllm

# Set environment variables
cp .env.example .env
# Edit .env with API keys

# Start
docker-compose up -d

# Verify
curl http://localhost:3000/health
# → {"status": "ok", "version": "1.0.0"}
```

---

## ☁️ Mode 3 — Cloud Deployment (Your Hosted SaaS)

When you're ready to run CipherLLM as a service, deploy to Railway or Render.

### Recommended: Railway (Easiest, Cheapest For Starting Out)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

Railway auto-detects Node.js, sets up the environment, gives you a URL.
Cost: ~$5/month for starter. Free tier available.

---

### Alternative: Render

```yaml
# render.yaml
services:
  - type: web
    name: cipherllm-gateway
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
```

Push to GitHub → Connect Render → Auto-deploys on every push.

---

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# LLM Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Security
MASTER_KEY=<32-byte-hex-string>    # for vault encryption
JWT_SECRET=<random-64-char-string> # for API auth

# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

Generate the master key securely:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 Production Security Checklist

### Before Going Live

- [ ] **Never hardcode API keys** — always use environment variables
- [ ] **Enable HTTPS only** — no HTTP in production (Railway/Render handle this)
- [ ] **Rate limiting** — prevent abuse of your proxy endpoint
- [ ] **API key authentication** — every client must send a valid key
- [ ] **Input size limits** — reject prompts over 10,000 tokens
- [ ] **CORS policy** — whitelist only your known domains
- [ ] **Helmet.js headers** — security HTTP headers

### Authentication Middleware

```typescript
// src/middleware/auth.ts
export function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || !isValidApiKey(key)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 100,               // 100 requests per minute per IP
  message: { error: 'Too many requests' }
});

app.use('/v1/', limiter);
```

---

## 📊 Monitoring In Production

### Health Check Endpoint

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

### Sentry Integration (Already Used In Flow-q)

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Never log prompt content — only errors and metadata
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = '[REDACTED]'; // Even Sentry doesn't see prompts
    }
    return event;
  }
});
```

---

## 🌐 Domain + SSL

For a production URL like `api.cipherllm.in`:

1. Buy domain on GoDaddy or Namecheap (~₹800/year for `.in`)
2. Deploy on Railway/Render → they provide free SSL automatically
3. Add custom domain in Railway dashboard
4. Point DNS A record to Railway IP

---

## 📋 Deployment Checklist Per Phase

### Phase 1 — Local npm Package
- [ ] TypeScript compiles without errors
- [ ] All Jest tests passing
- [ ] README with install instructions
- [ ] Published to npm: `npm publish`
- [ ] Test install from scratch: `npm install cipherllm`

### Phase 2 — Docker Self-Hosted
- [ ] Dockerfile builds successfully
- [ ] docker-compose runs without errors
- [ ] Health check endpoint returns 200
- [ ] Volumes persist vault data correctly
- [ ] `.env.example` has all required variables documented

### Phase 3 — Cloud Deployment
- [ ] Railway/Render deployment live
- [ ] Custom domain configured
- [ ] HTTPS working
- [ ] Rate limiting active
- [ ] API key auth working
- [ ] Sentry monitoring active
- [ ] Zero prompt content in any logs

### Phase 4 — Enterprise Ready
- [ ] 99.9% uptime SLA documentation
- [ ] Penetration test or security review
- [ ] DPDP compliance documentation
- [ ] Audit log export feature
- [ ] Multi-region deployment option (data residency)

---

## 🧾 What To Put In Your README For GitHub

```markdown
# CipherLLM

Privacy-preserving prompt gateway for LLMs.
Redacts PII before it reaches any AI provider — including Aadhaar, PAN, UPI IDs.

## Install
npm install cipherllm

## Use
import CipherLLM from 'cipherllm';
const cipher = new CipherLLM({ provider: 'openai' });
const response = await cipher.chat("Contract for Priya, Aadhaar 8234-5678-9012");
// Priya's data never touched OpenAI.

## Why
India's DPDP Act 2023 mandates protection of personal data in AI workflows.
CipherLLM is the only tool built India-first — handling Aadhaar, PAN, and ₹ salary patterns natively.

## Compliance
DPDP Act 2023 ✓  |  GDPR ✓  |  HIPAA ✓
```

A clean README with a one-line install is worth more than a 10-page document nobody reads.

---

*Deploy simple. Deploy honest. Scale after people use it.*
