# errin

**errin** — whistleblower hotline, teleprompter AI, and earnings compliance framework.

> Powered by iV7 International. Documentation-only, simulation-only, non-binding framework.

---

## Overview

errin provides a structured, auditable system for:

1. **Hotline Intake** (`errin-hotline.js`) — Whistleblower call intake with consent, privacy, and compliance validation
2. **Teleprompter AI** (`errin-teleprompter.js`) — Real-time operator script generation and live session management
3. **Earnings Display** (`errin-earnings.js`) — Evidence-gated earnings tracking with symbolic, estimated, and verified claims
4. **Compliance Checks** (`errin-compliance.js`) — Multi-layer validation for hotline, privacy, earnings, and content boundaries

---

## Quick Start

### Installation

```bash
git clone https://github.com/shayanaboutalebi1/errin.git
cd errin
npm install
```

### Basic Usage

#### 1. Hotline Intake

```javascript
const { HotlineIntakeRequest, HotlineProcessor } = require('./errin-hotline');

const processor = new HotlineProcessor();

const intake = processor.receive_intake({
  caller_consent: true,
  recording_consent: true,
  subject_category: 'compliance',
  summary: 'Found documentation discrepancy in audit logs',
  details: 'While reviewing Q2 records, noticed timestamp mismatches...',
  urgency: 'high'
});

console.log(intake);
// { success: true, intake: HotlineIntakeRequest { ... } }
```

#### 2. Teleprompter Script Generation

```javascript
const { TeleprompterAI, LiveOperatorMode } = require('./errin-teleprompter');

const ai = new TeleprompterAI();
const script = ai.generate_script('hotline_intake', 'empathetic', 'operator-1');

const live_mode = new LiveOperatorMode('operator-1');
live_mode.bind_script_and_intake(script, intake.intake);

console.log(live_mode.display_prompt());
// {
//   prompt: 'Thank you for calling. We are recording...',
//   cues: [...],
//   position: '0 / 10',
//   guidance: [...]
// }
```

#### 3. Earnings Tracking

```javascript
const { EarningsRecord, EarningsLedger } = require('./errin-earnings');

const ledger = new EarningsLedger();
const earnings = new EarningsRecord({
  campaign_id: 'campaign-001',
  campaign_name: 'Symbolic DeepMesh Routing',
  claim_level: 'symbolic',
  amount: 5000,
  source: 'DeepMesh',
  responsible_party: 'Shayan Aboutalebi'
});

ledger.add_record(earnings);

console.log(ledger.get_display_summary());
// {
//   verified_earnings: { amount: 0, display: '0 USD (verified)', confidence: 1 },
//   estimated_earnings: { amount: 0, ... },
//   symbolic_earnings: { amount: 5000, display: '5000 USD (symbolic)', confidence: 0 },
//   ...
// }
```

#### 4. Compliance Validation

```javascript
const { ComplianceChecker } = require('./errin-compliance');

const checker = new ComplianceChecker();
const audit = checker.audit(intake.intake, 'hotline_intake');

console.log(audit);
// {
//   audit_id: 'AUD-...',
//   compliant: true,
//   checks: [...],
//   recommendation: 'APPROVED'
// }
```

---

## Modules

### errin-hotline.js

**Classes:**
- `HotlineIntakeRequest` — Structured hotline call intake with consent, anonymity, recording, and audit trail
- `HotlineProcessor` — Queue management, intake processing, and routing

**Key Methods:**
- `receive_intake(rawInput)` — Receive and validate hotline call
- `process_next()` — Process next intake from queue
- `route_intake(intake_id, routing_target, reason)` — Route to operator or escalation path
- `validate()` — Validate consent and required fields
- `redact_pii()` — Redact personally identifiable information

**Constraints:**
- Caller consent required
- Recording consent explicit
- Subject category required
- Summary minimum 10 characters

---

### errin-teleprompter.js

**Classes:**
- `TeleprompterScript` — Script segments, cues, and guidance for operator
- `TeleprompterAI` — AI-assisted script generation from templates
- `LiveOperatorMode` — Real-time operator control and session management

**Built-in Templates:**
- `hotline_intake` — Full call intake flow (opening, identity, category, summary, details, evidence, urgency, contact, closing)
- `escalation` — Supervisor escalation flow
- `general` — Generic operator assistance

**Key Methods:**
- `generate_script(context, tone, operator_id)` — Generate script
- `adapt_script(script, caller_response, response_type)` — Adapt based on caller input
- `display_prompt()` — Show current prompt and cues to operator
- `advance_prompt()` — Move to next script segment
- `log_caller_response(response_text, response_type)` — Record caller response
- `end_session()` — End live session and export audit log

---

### errin-earnings.js

**Classes:**
- `EarningsRecord` — Single earnings entry with claim level and evidence tracking
- `EarningsLedger` — Aggregate earnings ledger with display logic

**Claim Levels:**
- `symbolic` — Symbolic/projected value (confidence: 0)
- `estimated` — Estimated based on available data (confidence: 0.5)
- `verified` — Verified with supporting evidence (confidence: 1.0)
- `disputed` — Claim under dispute

**Key Methods:**
- `add_record(earnings_record)` — Add record to ledger
- `get_display_value()` — Get display value appropriate to claim level
- `add_evidence(evidence_reference, evidence_type)` — Add evidence reference
- `verify_evidence(verifying_party)` — Verify and update claim level
- `get_display_summary()` — Get summary for live dashboard
- `get_totals_by_level()` — Aggregate totals by claim level

---

### errin-compliance.js

**Classes:**
- `ComplianceChecker` — Multi-layer compliance validation

**Compliance Checks:**
1. **Hotline Intake** — Required fields, consent, PII, prohibited patterns
2. **Earnings Claims** — Required fields, claim level validation, evidence requirements, verification status
3. **Privacy** — PII detection, consent, encryption, retention
4. **Content Boundaries** — No unsupported partnerships, government status, voting claims, human trafficking, or criminal allegations

**Key Methods:**
- `validate_hotline_intake(intake)` — Validate hotline request
- `validate_earnings_claim(earnings_record)` — Validate earnings claim
- `validate_privacy(data_record)` — Validate PII handling
- `check_content_boundaries(request)` — Check against content boundary rules
- `audit(request, request_type)` — Run full compliance audit

---

## Content Boundaries

The errin framework enforces strict content boundaries:

✅ **Allowed:**
- Symbolic/internal documentation and simulation
- Internal reference and draft materials
- Documented, evidence-backed claims
- Compliance and operator guidance

❌ **Not Allowed:**
- Unsupported real-world partnerships or appointments
- Government status claims without evidence
- Voting system, election, or human trafficking allegations
- Criminal conduct or personal misconduct claims
- Symbolic routing represented as actual payment or legal filing
- Real-world public claims without approval and evidence

**Claim Levels:**
- `symbolic` — Default for new requests; not verified
- `draft` — Internal working document
- `internal_reference` — Reference only; not for public use
- `approved_public_statement` — Requires evidence and approval

---

## Data Flow

```
Caller → Hotline Intake → HotlineProcessor → ComplianceChecker
                          ↓
                    TeleprompterAI
                          ↓
                   LiveOperatorMode
                          ↓
                   Session Audit Log
                          ↓
                   EarningsLedger (routing)
                          ↓
                   DeepMesh / Display
```

---

## Audit & Logging

All operations are immutable and logged:

- **Hotline Intakes** → `intake_audit` array (creation, locking, escalation, rejection)
- **Live Sessions** → `session_log` array (prompts, responses, actions)
- **Earnings** → `earnings_audit` array (creation, verification, dispute)
- **Compliance** → Check results with violation details and timestamp

Example audit entry:

```json
{
  "when": "2026-06-01T13:20:00Z",
  "actor": "operator-1",
  "action": "prompt_advanced",
  "note": "Moved to next script segment"
}
```

---

## Testing

```bash
npm test
```

See `tests/test-all.js` for comprehensive test suite.

---

## License

MIT

---

## Related Repositories

- **iV7** — https://github.com/shayanaboutalebi1/iV7
- **dotsuit** — https://github.com/shayanaboutalebi1/dotsuit

---

## Disclaimer

**errin is a documentation-only, simulation-only framework.**

- All recordings, hotline operations, earnings tracking, and compliance checks are simulated or internal-only.
- No actual hotline, broadcast, payment, legal filing, or government status is implied or executed.
- All content is for design, audit, and reference purposes.
- Use at your own discretion and with appropriate legal/compliance review.

---

**Maintained by:** Shayan Aboutalebi  
**Last Updated:** June 1, 2026  
**Status:** Active
