# Roadmap: CipherLLM

## Overview
CipherLLM will be built in two major milestones. Milestone 1 focuses on the core privacy engine (regex-based) and the LLM proxy gateway. Milestone 2 adds intelligence (NER), a management dashboard, and distribution via npm.

## Phases

- [x] **Phase 1: Core Engine** - Regex detection, Token Vault logic, and Re-hydration.
- [x] **Phase 2: Provider Proxy** - Implementing OpenAI/Anthropic SDK abstraction and Express gateway.
- [x] **Phase 3: Security & Storage** - AES-256-GCM vault encryption and session management.
- [x] **Phase 4: Intelligence Layer** - Integrating `compromise` for local name and entity detection.
- [x] **Phase 5: Dashboard UI** - Next.js dashboard for real-time monitoring and analytics.
- [x] **Phase 6: Distribution** - npm package publishing and VS Code extension prototype.
- [x] **Phase 7: Compliance** - Audit log generation and DPDP Act compliance reporting.
- [x] **Phase 8: npm-Only Refactor & Strategic Alignment**
    - [x] Strip server-side infrastructure (Express, CORS, dot-env)
    - [x] Archive previous dashboard version and server code
    - [x] Implement 5-layer Gold Standard Architecture (Types -> Detection -> Vault -> Providers -> Gateway)
    - [x] Migrated to native ESM for modern dependency support (uuid v13)
    - [x] Unified public API in `src/lib.ts`
    - [x] Verified build and integration tests (100% pass)
- [ ] **Phase 9: Documentation & Integration Dashboard** - Interactive landing page for npm package.

## Phase Details

### Phase 1: Core Engine
**Goal**: Implement the fundamental logic for PII detection (regex), tokenization (vault), and restoration (re-hydration).
**Depends on**: Nothing
**Requirements**: REQ-001, REQ-002.1, REQ-002.2
**Success Criteria**:
  1. Aadhaar, PAN, and Email strings are correctly identified in sample prompts.
  2. Tokens are unique per value but consistent within a session.
  3. Re-hydration accurately restores original values from a tokenized response.
**Plans**: 3 plans

Plans:
- [x] 01-01: Implement PII detection regex library.
- [x] 01-02: Build TokenVault mapping logic.
- [x] 01-03: Implement Re-hydration engine with fuzzy matching.

### Phase 2: Provider Proxy
**Goal**: Create a unified proxy that can talk to OpenAI and Anthropic while applying redaction.
**Depends on**: Phase 1
**Requirements**: REQ-003, REQ-NF1
**Success Criteria**:
  1. Prompts sent to LLM providers contain only tokens, no raw PII.
  2. The system can switch between OpenAI and Anthropic via configuration.
**Plans**: 2 plans

### Phase 3: Security & Storage
**Goal**: Secure the vault with AES-256-GCM encryption and manage sessions.
**Depends on**: Phase 1
**Requirements**: REQ-002.3, REQ-NF2
**Success Criteria**:
  1. Vault files stored on disk are encrypted and unreadable without the master key.
  2. Session data is isolated and cleared correctly when the session ends.
**Plans**: 2 plans

### Phase 4: Intelligence Layer
**Goal**: Add NLP-based entity detection for names and organizations.
**Depends on**: Phase 1
**Requirements**: REQ-004
**Success Criteria**:
  1. Common names and organization names are detected even when not matching regex patterns.
**Plans**: 1 plan

### Phase 5: Dashboard UI
**Goal**: Provide a visual interface for monitoring the proxy.
**Depends on**: Phase 2, Phase 3
**Requirements**: REQ-005.1
**Success Criteria**:
  1. Dashboard displays real-time redaction counts and session history.
**Plans**: 2 plans

### Phase 6: Distribution
**Goal**: Package CipherLLM for developer and enterprise use.
**Depends on**: Phase 1 through Phase 4
**Requirements**: REQ-NF3
**Success Criteria**:
  1. Can be installed and used as an npm package in a separate project.
**Plans**: 2 plans

### Phase 7: Compliance
**Goal**: Generate audit logs and compliance reports.
**Depends on**: Phase 5
**Requirements**: REQ-005.2
**Success Criteria**:
  1. PDF/JSON reports can be exported showing redaction metrics.
**Plans**: 1 plan

### Phase 8: npm-Only Refactor
**Goal**: Strip the project down to a clean, publishable npm library as per NPM_PLAN.md.
**Depends on**: Phase 6
**Requirements**: REQ-NF3
**Success Criteria**:
  1. No server-side or dashboard code remains in the published package.
  2. Library is successfully publishable and installable via npm.
**Plans**: 0 plans

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Engine | 3/3 | Complete | 2026-04-14 |
| 2. Provider Proxy | 2/2 | Complete | 2026-04-14 |
| 3. Security & Storage | 2/2 | Complete | 2026-04-14 |
| 4. Intelligence Layer | 1/1 | Complete | 2026-04-14 |
| 5. Dashboard UI | 2/2 | Complete | 2026-04-14 |
| 6. Distribution | 2/2 | Complete | 2026-04-14 |
| 7. Compliance | 1/1 | Complete | 2026-04-14 |
| 8. npm-Only Refactor | 0/0 | In Progress | - |
| 9. Documentation Dashboard | 0/3 | In Progress | - |

---
*Last updated: 2026-04-18*
