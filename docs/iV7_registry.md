# iV7 Registry

This document describes how seeds, campaign files, and registry entries are managed within iV7.

... (existing registry content)

## Campaign Seed Entries

Campaign seed files (.suit) are documentation-only descriptors that represent symbolic campaign or cultural influence seeds. They must never be used to assert real-world partnerships, broadcasts, legal filings, or payments unless accompanied by a verifiable approval artifact and evidence manifest.

Required fields for a Campaign Seed Entry (symbolic .suit files)

- id (string): unique seed identifier
- type (string): e.g. "cultural_influence_campaign", "operational_seed"
- subject (string): named subject of the seed (person, concept, product)
- campaign or role_evolution (object): short description of the campaign or role evolution
- operational_layer (object): mapping to internal systems (e.g. wareZwolf, recoveryOS, emotion_processing)
- deepmesh_routing (object): { dispatch_target, dispatch_purpose, responsible }
- constraints (object): legal and compliance constraints, including claim_level

Rules

1. All seed files and registry entries MUST be documented as documentation-only and simulation-only by default. The default claim_level is symbolic.
2. Seeds that reference external entities (USPS, PBS, NPR, Library of Congress, public figures, brands) MUST treat those references as symbolic unless a contract, signed authorization, or verifiable artifact is included in an evidence_manifest.
3. Seeds may include historical or cultural commentary but must not be used to make factual claims about ongoing legal, electoral, or criminal matters.
4. Any seed that includes burn-language ("burn", "decommission", "destroy") must include a Burn / Decommissioning section in the seed describing the archival intent and authorization artifacts.

Example pointer

See iV7/suit/robert_james_ritchie_televangelist_role.suit as an example of a cultural influence campaign seed. That file should remain symbolic and documented in this registry.

Adding new seeds

When adding a new .suit file to iV7/suit/, add an entry to the registry describing the seed id, type, subject, responsible party, and constraints. Include a pointer to any evidence_manifest if available.

Compliance reminder

Promoting any seed from symbolic to an approved_public_statement requires approval_contact verification and evidence_manifest entries. Registry maintainers will not promote seeds without full evidence and an explicit approval workflow.
