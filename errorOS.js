// errorOS - logistics and compliance augmentation

const CATEGORIES = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  DATABASE: "DATABASE",
  MEMORY: "MEMORY",
  PERMISSION: "PERMISSION",
  INVALID_INPUT: "INVALID_INPUT",
  UNKNOWN: "UNKNOWN",

  // New logistics/compliance categories
  ROUTING_CONSTRAINT: "ROUTING_CONSTRAINT",
  MISSING_EVIDENCE: "MISSING_EVIDENCE",
  NON_BINDING_CLAIM_RISK: "NON_BINDING_CLAIM_RISK",
  BURN_CONSTRAINT: "BURN_CONSTRAINT",
  HOTLINE_PRIVACY_RISK: "HOTLINE_PRIVACY_RISK",
  LIVE_EARNINGS_RISK: "LIVE_EARNINGS_RISK"
};

const DEFAULT_REMEDIATION_RULES = {
  NETWORK: "retry_with_backoff",
  TIMEOUT: "increase_timeout_or_retry",
  DATABASE: "inspect_db_and_recover",
  MEMORY: "resource_cleanup",
  PERMISSION: "check_and_request_permissions",
  INVALID_INPUT: "validate_and_reject",
  UNKNOWN: "escalate",

  // Logistics remediation rules
  ROUTING_CONSTRAINT: "block_and_request_review",
  MISSING_EVIDENCE: "request_evidence",
  NON_BINDING_CLAIM_RISK: "fail_fast_compliance_review",
  BURN_CONSTRAINT: "block_destructive_burn_review",
  HOTLINE_PRIVACY_RISK: "privacy_review_and_hold",
  LIVE_EARNINGS_RISK: "evidence_gating_and_hold"
};

function categorize(errorMessage) {
  const msg = (errorMessage || "").toLowerCase();

  if (/routing constraint|routing constrained|cannot route|unauthorized route/.test(msg)) return CATEGORIES.ROUTING_CONSTRAINT;
  if (/missing evidence|evidence missing|delivery receipt missing|no receipt/.test(msg)) return CATEGORIES.MISSING_EVIDENCE;
  if (/unauthorized partnership|unauthorized partnership|non-binding constraint|non-binding claim/.test(msg)) return CATEGORIES.NON_BINDING_CLAIM_RISK;
  if (/burn one|burn request|destructive burn|unmanaged shutdown|decommission without evidence/.test(msg)) return CATEGORIES.BURN_CONSTRAINT;
  if (/hotline|whistleblower|recording consent|privacy consent|live intake/.test(msg)) return CATEGORIES.HOTLINE_PRIVACY_RISK;
  if (/amount earned|live earnings|live amount|amount live|earned live/.test(msg)) return CATEGORIES.LIVE_EARNINGS_RISK;

  // fallback to simple heuristics
  if (/timeout/.test(msg)) return CATEGORIES.TIMEOUT;
  if (/network/.test(msg)) return CATEGORIES.NETWORK;
  if (/permission/.test(msg)) return CATEGORIES.PERMISSION;
  if (/memory/.test(msg)) return CATEGORIES.MEMORY;
  if (/invalid|invalid input|bad request/.test(msg)) return CATEGORIES.INVALID_INPUT;

  return CATEGORIES.UNKNOWN;
}

function analyzeRootCause(category, rawMessage) {
  const suggestions = [];
  switch (category) {
    case CATEGORIES.ROUTING_CONSTRAINT:
      suggestions.push("This request appears to violate routing constraints in docs/iV7_logistics_api.md.");
      suggestions.push("Check the request.claim_level and routing_target; if symbolic, ensure no external broadcast is implied.");
      suggestions.push("If appropriate, attach evidence_manifest and request a compliance review.");
      break;
    case CATEGORIES.MISSING_EVIDENCE:
      suggestions.push("Missing or incomplete evidence_manifest. Attach proof (signed contract, receipt, authorization) before promotion.");
      suggestions.push("Refer to docs/iV7_logistics_api.md -> evidence_required for required artifacts.");
      break;
    case CATEGORIES.NON_BINDING_CLAIM_RISK:
      suggestions.push("This item risks being interpreted as a binding claim. Reduce claim_level to symbolic or provide approval artifacts.");
      suggestions.push("See docs/iV7_logistics_api.md Content Boundaries for forbidden uses.");
      break;
    case CATEGORIES.BURN_CONSTRAINT:
      suggestions.push("Burn-language detected. Ensure this is a controlled decommissioning request with authorization artifacts.");
      suggestions.push("Block destructive actions until compliance approves. See registry rules in docs/iV7_registry.md.");
      break;
    case CATEGORIES.HOTLINE_PRIVACY_RISK:
      suggestions.push("Hotline/whistleblower intake detected. Verify recording and privacy consent procedures and legal intake flow.");
      suggestions.push("Attach intake script, consent forms, and approval_contact before enabling live intake.");
      break;
    case CATEGORIES.LIVE_EARNINGS_RISK:
      suggestions.push("Live earnings display detected. Distinguish between projected_estimate and verified_amount; only verified_amount may be public.");
      suggestions.push("Require evidence_manifest entries for any public financial claims.");
      break;
    default:
      suggestions.push("General diagnostic: inspect logs for stack traces and context. If unclear, escalate to on-call.");
  }

  return {
    category,
    suggestions,
    reference_docs: [
      "docs/iV7_logistics_api.md",
      "docs/iV7_registry.md"
    ]
  };
}

module.exports = {
  CATEGORIES,
  DEFAULT_REMEDIATION_RULES,
  categorize,
  analyzeRootCause
};
