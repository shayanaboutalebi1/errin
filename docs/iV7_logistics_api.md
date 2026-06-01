# iV7 Logistics API

Version: 0.1 (proposal)

Scope

- Documentation-only, simulation-only, non-binding. This API is an internal logistics contract for carrying work-items, campaign seeds, and evidence manifests inside iV7 for tracing, simulation, review, and audit. It does NOT represent legal, financial, broadcast, or governmental execution.

Core resource: LogisticsRequest

Fields (required unless noted)

- request_id (string): unique request identifier, e.g. "LOG-20260601-ELLA-001"
- owner (string): human or team responsible for the request (name or handle)
- task_summary (string): one-line summary of the work
- task_details (string): longer description of what should happen; may reference .suit seeds
- priority (enum): low | medium | high
- due_date_utc (string, optional): ISO-8601 UTC due date
- success_criteria (string): how success will be measured
- evidence_required (string): brief description of what evidence is required before promotion to approved_public_statement
- approval_contact (string, optional): contact for approvals / compliance
- responsible_party (string): who will drive this request (person/team)
- responsibility_statement (string): short responsibility assertion

Logistics-specific fields

- campaign_id (string, optional): if the request relates to a .suit campaign seed
- routing_target (string): primary target for dispatch (e.g. "iV7 DeepMesh")
- constraints (array[string], optional): human-readable constraints (e.g. ["symbolic-only","no-external-broadcast"])
- evidence_manifest (object, optional): list of evidence items (type, url, hash)
- deepmesh_dispatch (object, optional): indicates symbolic dispatch metadata
- claim_level (enum): symbolic | draft | internal_reference | approved_public_statement
- status (enum): received | queued | in_progress | blocked | completed | returned

Behavior & defaults

- All new LogisticsRequest objects MUST default to claim_level: symbolic unless explicitly set and evidenced.
- Requests that increase claim_level to approved_public_statement MUST include evidence_manifest entries and an approval_contact with verifiable approval artifact.

Content Boundaries

The logistics API MUST NOT be used to:

1. Claim real-world partnerships, appointments, broadcasts, or government status without evidence (contract, signed authorization, or verifiable artifact).
2. Target private individuals or private family members for public campaigns or allegations.
3. Make unsupported claims about voting systems, elections, human trafficking, criminal conduct, or personal misconduct.
4. Represent symbolic iV7 routing as actual payment, legal tender, government filing, or broadcast distribution.
5. Convert campaign/meme/PSA drafts into real-world public claims without a separate approval and evidence process.

Claim level guidance

- symbolic: Documentation-only, simulation-only. Default value for new requests.
- draft: Internal draft for discussion and planning; not for public statements.
- internal_reference: Used in internal dashboards and audits; not public-facing.
- approved_public_statement: Requires evidence_manifest and an approval_contact; may be shown externally after compliance review.

Example JSON request (Ella Cook Memorial Scholarship — symbolic)

{
  "request_id": "LOG-20260601-ELLA-001",
  "owner": "Shayan Aboutalebi",
  "task_summary": "Promote Ella Cook Memorial Scholarship (symbolic)",
  "task_details": "Create symbolic marketing and archival seed for the Ella Cook Memorial Scholarship and route as documentation-only to DeepMesh for cultural capital recording.",
  "priority": "medium",
  "due_date_utc": "2026-06-15T00:00:00Z",
  "success_criteria": "Seed documented in registry; DeepMesh dispatch recorded as symbolic.",
  "evidence_required": "none (documentation-only)",
  "approval_contact": "compliance@example.org",
  "responsible_party": "Shayan Aboutalebi",
  "responsibility_statement": "I am responsible. — Shayan Aboutalebi",
  "campaign_id": "ella_cook_memorial_scholarship_001",
  "routing_target": "iV7 DeepMesh",
  "constraints": ["symbolic-only","non-binding"],
  "claim_level": "symbolic",
  "status": "queued"
}

Example JSON response (API consumer view)

{
  "request_id": "LOG-20260601-ELLA-001",
  "status": "queued",
  "assigned_to": "iV7 Operations",
  "next_action": "awaiting evidence or review",
  "links": {
    "registry_entry": "docs/iV7_registry.md#campaign-seed-entries",
    "deepmesh_dispatch": "iV7 DeepMesh (symbolic record)"
  }
}

Guidance: Hotline, live-earnings, and burn-language

- Hotline / whistleblower intake: Any LogisticsRequest that requests a live hotline, live earnings display, or whistleblower intake flow MUST include evidence_required entries for privacy/legal consent, recording consent, operational intake procedures, and a designated approval_contact. Default claim_level remains symbolic until approvals and evidence are attached.

- Burn / Decommissioning: Requests using "burn", "burn one", "serial burn", or similar language must adhere to controlled decommissioning guidance. Such requests must include an evidence_manifest showing authorization and archival intent; they are treated as symbolic unless explicit authorization artifacts exist.

- Live earnings: Displays that show "amount earned" must be evidence-gated. The API supports separate fields for projected_estimate and verified_amount. Only verified_amount can be promoted to approved_public_statement with evidence_manifest entries.

Related docs and registry

- Registry rules for campaign seed files (.suit) are maintained in docs/iV7_registry.md. See the Campaign Seed Entries section for required fields and symbolic-only rules.

---

For questions or to propose changes to the contract, open an issue or PR against this repo. This file is a recommended starting point and should be refined with legal/compliance input before promotion beyond documentation-only use.
