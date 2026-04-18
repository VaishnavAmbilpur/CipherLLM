# Dashboard Guide

CipherLLM includes a Next.js 14 dashboard for real-time monitoring.

## 🚀 Setup

1. **Start the Backend:**
   ```bash
   npm start
   ```

2. **Start the Dashboard:**
   ```bash
   cd dashboard
   npm run dev
   ```

3. **Visit the UI:**
   Open [http://localhost:3001](http://localhost:3001) (or 3000 if not in use) in your browser.

## 📊 Features

### 1. Stats Grid
Real-time counts of:
- **Total Redactions:** Lifetime count of PII identified.
- **Active Sessions:** Number of unique session vaults in memory.
- **Latency:** Average turnaround time for the redaction loop.

### 2. Velocity Chart
An area chart showing the volume of PII intercepted over the last 12-24 hours.

### 3. Recent Intercepts
A live feed of the most recent redaction events.
- **Type:** (e.g., PERSON, AADHAAR)
- **Token:** The unique ID generated.
- **Timestamp:** Exact moment of interception.

---

## 🎨 Under the hood
- **Next.js 14 App Router**
- **Tailwind CSS** for the premium dark theme.
- **Recharts** for the analytics layer.
- **Lucide React** for icons.
