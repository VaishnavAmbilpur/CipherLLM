# Compliance & India DPDP Act 2023

CipherLLM provides the technical safeguards required for modern data protection acts.

## 1. Compliance with Digital Personal Data Protection (DPDP) Act 2023
The India DPDP Act requires organizations to protect personal data from unauthorized processing. CipherLLM helps you achieve this by:

- **Data Minimization:** Only non-personal tokens reach the cloud AI.
- **Purpose Limitation:** Data usage is tracked via session-isolated vaults.
- **Technical Safeguards:** Encrypted storage ensures "Personal Data" (as defined by the Act) is protected at rest.

## 2. GDPR and HIPAA Alignment
- **Right to Erasure:** Simply calling `vault.destroy()` permanently removes the mapping for a session.
- **Privacy by Default:** The proxy defaults to redacting everything it recognizes.

## 3. Reporting
Use the `generateReport()` utility to export compliance summaries.

### Sample Report (JSON)
```json
{
  "totalRedactions": 1542,
  "uniqueTypes": ["AADHAAR", "PERSON", "EMAIL"],
  "sessionCount": 84,
  "topPIITypes": [
    { "type": "PERSON", "count": 840 },
    { "type": "EMAIL", "count": 412 }
  ]
}
```
This report can be attached to Data Protection Impact Assessments (DPIA) or provided to auditors.
