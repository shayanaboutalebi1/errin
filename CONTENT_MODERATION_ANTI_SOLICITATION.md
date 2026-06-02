Purpose
Design a neutral, auditable moderation pipeline that identifies solicitation (requests for money/pledges) and applies configured actions (rate limits, warnings, hold for human review), while preserving appeals and lawful transparency.

Definitions
- Solicitation: content that explicitly requests money, donations, gifts, or direct transfers (keywords, payment links, phrases).
- High-risk solicitation: repeated requests, requests linked to prohibited activity, or apparent automated mass-solicitation.

Pipeline overview
1. Ingest: all content (posts/comments/chat) passes through lightweight NLP filter.
2. Signal scoring: semantic model + heuristic rules produce a solicitation_score (0–100).
   - Features: payment link domains, currency mentions, verbs ("donate", "give", "support"), repeated ask patterns, impersonation signals.
3. Gate & actions:
   - Low score (<threshold_a): allow, log.
   - Medium score: soft-warning (auto message to user), rate-limit account posting, flag for human review.
   - High score: hold for manual review, hide content from public view pending review.
4. Human review & appeal:
   - Human moderators review evidence, clear/reject/require changes.
   - Provide user with appeal mechanism and transparent reason codes.
5. Payment provider compliance:
   - Block posting of direct payment links to unverified accounts; require verified payout account before linking.
6. Audit & logging:
   - Log full decision tree, model version, reviewer ID, timestamps; store for retention period.

Compliance & privacy
- Do not base actions on protected characteristics.
- Sanctions/KYC checks only on payable account creation and legal triggers.
- Maintain privacy by redacting sensitive identifiers in logs where required.

Operational controls
- Rate-limiting thresholds configurable and region-aware.
- Emergency override for public-interest communication (requires multi-person authorization).
- Regular model retraining with human-labeled examples and review of false positives.

Governance
- Policy owner and escalation contacts documented.
- Periodic transparency reports summarizing moderation actions (aggregated).
- Appeal and remediation processes.
