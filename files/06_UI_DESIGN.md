# CipherLLM — UI Design Document

---

## 🎨 Design Philosophy

CipherLLM is a **security product**. The UI must feel like it was built by people who take privacy seriously — not like a startup landing page or a ChatGPT clone.

The aesthetic direction: **Dark. Clinical. Precise.**

Think a terminal crossed with a bank vault. Every pixel should communicate:
> *"Your data is safe here. We are serious people."*

**The one thing users must remember:** The redaction counter. That live number — PII items intercepted — is the hero of the entire interface. Everything else supports it.

---

## 🎨 Color System

```
Primary Background      #0A0A0F    ← Near black. Serious.
Surface / Cards         #111118    ← Slightly lifted surface
Border                  #1E1E2E    ← Subtle separation
Border Accent           #2A2A3E    ← Hover states

Text Primary            #F0F0F5    ← Off-white. Not harsh.
Text Secondary          #7A7A9A    ← Muted labels
Text Muted              #3A3A5A    ← Disabled / placeholders

Accent Green            #00FF88    ← Protected / safe. The hero color.
Accent Green Dim        #00FF8820  ← Background glow
Accent Red              #FF4466    ← Detected / warning
Accent Red Dim          #FF446620  ← Background glow
Accent Blue             #4488FF    ← Info / neutral
Accent Yellow           #FFCC44    ← Pending / processing

Vault Locked            #00FF88    ← Active protection
Vault Unlocked          #FF4466    ← Exposed / warning
```

**CSS Variables:**
```css
:root {
  --bg-primary:     #0A0A0F;
  --bg-surface:     #111118;
  --bg-elevated:    #16161F;
  --border:         #1E1E2E;
  --border-accent:  #2A2A3E;

  --text-primary:   #F0F0F5;
  --text-secondary: #7A7A9A;
  --text-muted:     #3A3A5A;

  --accent-green:   #00FF88;
  --accent-red:     #FF4466;
  --accent-blue:    #4488FF;
  --accent-yellow:  #FFCC44;

  --glow-green:     0 0 20px #00FF8840;
  --glow-red:       0 0 20px #FF446640;
}
```

---

## 🔤 Typography

```
Display / Hero    →  "Space Mono" — monospace, technical, serious
                     Used for: the redaction counter, token labels, vault IDs

Headings          →  "Syne" — geometric, modern, sharp
                     Used for: section titles, page headers

Body              →  "DM Sans" — readable, clean, neutral
                     Used for: descriptions, paragraphs, labels

Code / Tokens     →  "JetBrains Mono" — clear, developer-native
                     Used for: [PERSON_1], code samples, API keys
```

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Scale:**
```
Hero Counter      72px   Space Mono 700
Page Title        36px   Syne 700
Section Title     24px   Syne 600
Card Title        18px   Syne 600
Body              15px   DM Sans 400
Label             13px   DM Sans 500
Caption           11px   DM Sans 400
Token             13px   JetBrains Mono 500
```

---

## 📐 Layout System

```
Max Width         1280px
Sidebar Width     260px
Content Area      flex-1
Gutter            24px
Card Padding      24px
Border Radius     8px  (cards)  |  4px  (tags)  |  12px  (modals)
```

**Grid:**
```
Dashboard: [Sidebar 260px] [Main Content flex-1]
Main Content: [Chat Panel 55%] [Vault Panel 45%]
Mobile: Single column stack
```

---

## 🖥️ Screens

---

### Screen 1 — Landing / Onboarding

The first screen a new user sees. One job: communicate what CipherLLM does in under 5 seconds.

```
┌─────────────────────────────────────────────────────────┐
│  ████████████████████████████████████████████████████  │
│  █                                                    █  │
│  █   [LOCK ICON]  CipherLLM                          █  │
│  █                                                    █  │
│  █   Your prompts carry secrets.                      █  │
│  █   We strip them before the AI sees anything.       █  │
│  █                                                    █  │
│  █   ┌───────────────────────────────────────────┐   █  │
│  █   │  Enter your OpenAI or Anthropic API Key   │   █  │
│  █   └───────────────────────────────────────────┘   █  │
│  █                                                    █  │
│  █   [  Start Protecting My Prompts  ]               █  │
│  █                                                    █  │
│  █   ──────────────────────────────────────────────  █  │
│  █   No data stored.  No account needed.              █  │
│  █   Your key never leaves your browser.              █  │
│  █                                                    █  │
│  ████████████████████████████████████████████████████  │
└─────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Full dark background from the first pixel
- The lock icon is the only graphic element — simple, universal, trusted
- Tagline is two sentences max. No feature list on landing.
- The trust line at the bottom ("No data stored") is in muted text — calm, not defensive
- CTA button glows green — the accent color signals safety

---

### Screen 2 — Main Dashboard

The core experience. Split into 3 zones.

```
┌──────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (260px)              CHAT PANEL (55%)    VAULT PANEL (45%)  │
├──────────────┬────────────────────────────────────┬──────────────────┤
│              │                                    │                  │
│  ⬡ CipherLLM│  ┌──────────────────────────────┐  │  TOKEN VAULT     │
│              │  │                              │  │  ─────────────   │
│  ─────────── │  │   AI Response Here           │  │  Session #A3F2   │
│              │  │                              │  │                  │
│  🟢 Protected│  │   The contract for           │  │  [PERSON_1]      │
│  1,203 items │  │   Priya Sharma specifies     │  │  → Priya Sharma  │
│              │  │   ₹18,50,000 per annum.      │  │                  │
│  ─────────── │  │   HR can reach her at        │  │  [AADHAAR_1]     │
│              │  │   priya@techcorp.in          │  │  → 8234-5678-... │
│  PROVIDERS   │  │                              │  │                  │
│  ● OpenAI    │  └──────────────────────────────┘  │  [EMAIL_1]       │
│  ○ Claude    │                                    │  → priya@tech... │
│  ○ Gemini    │  ┌──────────────────────────────┐  │                  │
│              │  │  Your message...             │  │  [SALARY_1]      │
│  ─────────── │  │                              │  │  → ₹18,50,000    │
│              │  │                    [  Send  ] │  │                  │
│  SETTINGS    │  └──────────────────────────────┘  │  ─────────────   │
│  Audit Log   │                                    │  4 items vault   │
│  API Keys    │  ████████████████ INTERCEPTED: 4   │  🔒 Encrypted    │
│  Docs        │                                    │                  │
└──────────────┴────────────────────────────────────┴──────────────────┘
```

**Zone 1 — Sidebar (Left)**
- Logo + product name
- Total protected count (all-time) — in green, Space Mono font
- Provider selector (radio buttons, clean)
- Settings links at the bottom

**Zone 2 — Chat Panel (Center)**
- Standard chat UI but with one critical difference: a red flash when PII is detected in the input, then green when it's been stripped
- The bottom bar shows "INTERCEPTED: N" in Space Mono after every message
- Message bubbles: user (right, dark surface), AI (left, slightly lighter surface)

**Zone 3 — Vault Panel (Right)**
- Real-time list of what was detected and tokenized this session
- Each item shows: `[TOKEN_ID]` and the original value (blurred by default, click to reveal)
- Session ID in the header
- 🔒 Encrypted indicator at the bottom

---

### Screen 3 — Live Redaction Visualization

The most distinctive screen. Shows what is being stripped in real time.

```
┌─────────────────────────────────────────────────────────────────────┐
│  BEFORE (Your Prompt)                → AFTER (Sent to LLM)          │
│  ─────────────────────────                ──────────────────────    │
│                                                                      │
│  "Summarize the contract            "Summarize the contract          │
│   for ████████████,                  for [PERSON_1],                │
│   Aadhaar ████████████,              Aadhaar [AADHAAR_1],           │
│   email ██████████████,              email [EMAIL_1],               │
│   salary ██████████"                 salary [SALARY_1]"             │
│                                                                      │
│  ──────────────────────────────────────────────────────────────     │
│                                                                      │
│  4 items redacted        PERSON  AADHAAR  EMAIL  SALARY             │
│  LLM never saw real data ●●●●                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key behavior:**
- The red highlighted/blurred blocks in "Before" animate — they visually "burn away" as they get replaced
- The "After" column builds in simultaneously
- Type tags at the bottom light up one by one as each PII type is detected

---

### Screen 4 — Analytics Dashboard

For users who want to see their protection history.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Protection Analytics                              Last 30 days ▾   │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  1,203       │  │  47          │  │  8            │             │
│  │  Items       │  │  Sessions    │  │  Providers    │             │
│  │  Protected   │  │  Protected   │  │  Used         │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
│  PII Type Breakdown              Interceptions Over Time            │
│  ─────────────────               ────────────────────              │
│  EMAIL     ████████ 34%          ▂▃▄▅▆▇█▇▆▅▇█▇▅▄▅▆▇█             │
│  PERSON    ██████   28%                                             │
│  AADHAAR   ████     18%                                             │
│  PHONE     ███      12%                                             │
│  OTHER     ██        8%                                             │
│                                                                      │
│  [ Export Compliance Report ]   [ Download Audit Log ]              │
└─────────────────────────────────────────────────────────────────────┘
```

**Stat cards:** Dark surface, green number, muted label. Space Mono for numbers.
**Bar chart:** Horizontal bars in accent green, percentage in muted text.
**Line chart:** Sparkline only — no axes, no labels. Just the shape of protection over time.

---

### Screen 5 — Audit Log

For compliance officers and enterprises.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Audit Log                    [ Filter ▾ ]  [ Export CSV ]         │
│  ─────────────────────────────────────────────────────────         │
│                                                                      │
│  Timestamp              Type       Action        Provider           │
│  ─────────────────────────────────────────────────────────         │
│  2026-04-13 10:23:45    AADHAAR    TOKENIZED     openai             │
│  2026-04-13 10:23:45    PERSON     TOKENIZED     openai             │
│  2026-04-13 10:23:45    EMAIL      TOKENIZED     openai             │
│  2026-04-13 10:23:12    SALARY     TOKENIZED     anthropic          │
│  2026-04-13 10:22:55    PAN        TOKENIZED     openai             │
│  2026-04-13 10:21:30    PHONE      TOKENIZED     openai             │
│  ─────────────────────────────────────────────────────────         │
│  Note: Original values are never logged. Only type and action.      │
│                                                                      │
│  DPDP Compliant ✓  |  GDPR Compliant ✓  |  HIPAA Compliant ✓      │
└─────────────────────────────────────────────────────────────────────┘
```

**Critical:** The actual PII value is NEVER shown in the audit log. Only the type (AADHAAR, EMAIL, etc.) and the action (TOKENIZED). This is intentional and must be communicated clearly to the user.

---

## 🧩 Component Library

---

### Token Tag
```
Visual:   [PERSON_1]
Style:    Background: #00FF8820
          Border: 1px solid #00FF8840
          Text: #00FF88
          Font: JetBrains Mono 13px
          Padding: 2px 8px
          Border-radius: 4px
```

### PII Type Badge
```
Visual:   AADHAAR
Style:    Background: #FF446620
          Border: 1px solid #FF446640
          Text: #FF4466
          Font: DM Sans 11px 500
          Padding: 2px 6px
          Border-radius: 4px
          All caps
```

### Redaction Counter (Hero Element)
```
Visual:   47
          ITEMS PROTECTED
Style:    Number: Space Mono 72px #00FF88
          Label: DM Sans 13px #7A7A9A
          Letter-spacing: 0.1em on label
          Glow: box-shadow: 0 0 40px #00FF8830
```

### Vault Item Row
```
Visual:   [PERSON_1]  →  ████████████  [reveal]
Style:    Token: JetBrains Mono, accent green
          Arrow: muted
          Value: blurred (filter: blur(4px)) until hover/click
          Reveal button: text link, muted, hover → secondary
          Border-bottom: 1px solid var(--border)
          Padding: 12px 0
```

### Provider Selector
```
Visual:   ● OpenAI
          ○ Anthropic
          ○ Gemini
Style:    Custom radio dots — filled = green, empty = border only
          Font: DM Sans 14px
          Selected item: text-primary
          Unselected: text-muted
```

### Status Indicator
```
Protected:   🟢  Pulsing green dot + "Protected" in green
Processing:  🟡  Pulsing yellow dot + "Processing..."
Exposed:     🔴  Red dot + "Not Protected" in red
```

### Send Button
```
Default:  Background: #00FF88  Text: #0A0A0F  (dark text on bright green)
Hover:    Background: #00FF88CC  Glow: var(--glow-green)
Loading:  Spinner replacing text, same green background
Font:     DM Sans 14px 500
Padding:  10px 24px
Radius:   6px
```

---

## ✨ Micro-Interactions

### PII Detected in Input
```
Trigger:  User types Aadhaar pattern / email / etc.
Action:   The matching text gets a subtle red underline animation
          A small badge appears above: "AADHAAR DETECTED"
          Input border flashes red → fades back to default
Duration: 400ms
```

### Token Swap Animation (Redaction Visualization)
```
Trigger:  Message is sent and sanitized
Action:   PII text in the "before" view gets a scanline wipe effect:
          Original text fades out left → token fades in right
          Each token blinks once after appearing
Duration: 600ms total, staggered 80ms per token
```

### Vault Item Add
```
Trigger:  New item added to vault
Action:   Item slides in from the right
          Row flashes green once
          Counter increments with a number tick animation
Duration: 300ms slide + 200ms flash
```

### Counter Increment
```
Trigger:  Interception count increases
Action:   Number rolls up (slot machine style)
          Brief green glow pulse on the counter
Duration: 400ms
```

### Protection Status Toggle
```
Trigger:  Session starts / ends
Action:   Status dot pulses
          Color transitions: grey → yellow (connecting) → green (protected)
Duration: Smooth 600ms color transition
```

---

## 📱 Mobile Layout (Responsive)

On screens under 768px, the three-panel layout collapses:

```
┌──────────────────────┐
│  ⬡ CipherLLM   [≡]  │  ← Header with hamburger
├──────────────────────┤
│  🟢 47 Protected     │  ← Compact counter
├──────────────────────┤
│                      │
│  Chat messages       │  ← Full width chat
│  appear here         │
│                      │
├──────────────────────┤
│  [PERSON_1] [+3]  🔒 │  ← Vault summary (tap to expand)
├──────────────────────┤
│  [  Type a message  ]│  ← Input
│               [Send] │
└──────────────────────┘
```

- Vault panel becomes a bottom sheet (swipe up to expand)
- Sidebar becomes a slide-in drawer
- Counter shrinks to a badge in the header

---

## 🌑 Dark Mode Only

CipherLLM does **not** have a light mode. This is intentional.

Security products are used in offices, late at night, in high-stakes environments. Dark mode is not a preference — it's the product's identity. A light mode would make it feel like a consumer app.

---

## 🚫 What To Never Do

```
❌  Purple gradients on white backgrounds
❌  Rounded pill buttons everywhere
❌  Emoji in product copy (except status indicators)
❌  Comic Sans, Inter, or Roboto
❌  Pastel colors
❌  Animated backgrounds that distract from the data
❌  Show actual PII in logs or analytics
❌  Success toasts that say "Awesome!" or "Great job!"
    → Instead: "Session protected. 4 items intercepted."
```

---

## ✅ Summary — The 5 Design Rules

```
1. DARK ALWAYS          No light mode. Ever.
2. GREEN = SAFE         Accent green is the only positive color.
3. NUMBERS FIRST        The counter is the hero. Typography makes it loud.
4. DATA NEVER SHOWN     Vault values are blurred by default. Always.
5. SERIOUS COPY         "4 items protected." Not "You're all set! 🎉"
```

---

*The design should feel like the product works — quiet, precise, and trustworthy.*
*If it looks like a startup landing page, start over.*
