/**
 * errin-compliance.js
 * Hotline, privacy, and earnings compliance checks.
 * Validates requests against content boundaries and regulatory constraints.
 */

const crypto = require('crypto');

/**
 * ComplianceChecker — validates requests against compliance rules
 */
class ComplianceChecker {
  constructor() {
    this.compliance_rules = this.loadRules();
    this.violations = [];
  }

  loadRules() {
    return {
      hotline_intake: {
        required_fields: ['caller_consent', 'subject_category', 'summary'],
        consent_required: ['recording_consent', 'caller_consent'],
        pii_redaction: true,
        max_summary_length: 5000,
        prohibited_patterns: [
          /\b(bomb|threat|violence|illegal|fraud)\b/i // basic keyword filter
        ]
      },
      earnings_claim: {
        required_fields: ['claim_level', 'amount', 'source', 'responsible_party'],
        claim_levels: ['symbolic', 'estimated', 'verified'],
        verification_required_for: ['verified', 'disputed'],
        evidence_required_for: ['verified'],
        max_unverified_amount: 10000, // symbolic/estimated max
        prohibited_claims: [
          'government subsidy',
          'tax fraud',
          'money laundering',
          'illegal earnings'
        ]
      },
      privacy: {
        pii_types: ['email', 'phone', 'ssn', 'credit_card', 'ip_address'],
        consent_required_for_pii: true,
        retention_days: 90,
        encryption_required: true
      }
    };
  }

  /**
   * Validate hotline intake for compliance
   */
  validate_hotline_intake(intake) {
    const violations = [];

    // Check required fields
    const required = this.compliance_rules.hotline_intake.required_fields;
    required.forEach(field => {
      if (!intake[field]) {
        violations.push(`Missing required field: ${field}`);
      }
    });

    // Check consent
    const consent_fields = this.compliance_rules.hotline_intake.consent_required;
    consent_fields.forEach(field => {
      if (intake[field] !== true && intake[field] !== false) {
        violations.push(`Consent field not properly set: ${field}`);
      }
    });

    // Check summary length
    if (intake.summary && intake.summary.length > this.compliance_rules.hotline_intake.max_summary_length) {
      violations.push(`Summary exceeds maximum length of ${this.compliance_rules.hotline_intake.max_summary_length}`);
    }

    // Check for prohibited patterns
    const patterns = this.compliance_rules.hotline_intake.prohibited_patterns;
    const text = (intake.summary + ' ' + intake.details).toLowerCase();
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        violations.push(`Prohibited content detected: ${pattern.source}`);
      }
    });

    return {
      compliant: violations.length === 0,
      violations,
      check_type: 'hotline_intake',
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Validate earnings claim for compliance
   */
  validate_earnings_claim(earnings_record) {
    const violations = [];

    // Check required fields
    const required = this.compliance_rules.earnings_claim.required_fields;
    required.forEach(field => {
      if (!earnings_record[field]) {
        violations.push(`Missing required field: ${field}`);
      }
    });

    // Validate claim_level
    if (!this.compliance_rules.earnings_claim.claim_levels.includes(earnings_record.claim_level)) {
      violations.push(`Invalid claim_level: ${earnings_record.claim_level}`);
    }

    // Check evidence requirements
    if (this.compliance_rules.earnings_claim.evidence_required_for.includes(earnings_record.claim_level)) {
      if (!earnings_record.evidence_references || earnings_record.evidence_references.length === 0) {
        violations.push(`Evidence required for claim_level "${earnings_record.claim_level}"`);
      }
    }

    // Check verification requirements
    if (this.compliance_rules.earnings_claim.verification_required_for.includes(earnings_record.claim_level)) {
      if (earnings_record.evidence_status !== 'verified') {
        violations.push(`Verification required for claim_level "${earnings_record.claim_level}"`);
      }
    }

    // Check unverified amount limit
    if (earnings_record.claim_level !== 'verified' && earnings_record.amount > this.compliance_rules.earnings_claim.max_unverified_amount) {
      violations.push(`Unverified amount ${earnings_record.amount} exceeds limit ${this.compliance_rules.earnings_claim.max_unverified_amount}`);
    }

    // Check for prohibited claims
    const prohibited = this.compliance_rules.earnings_claim.prohibited_claims;
    prohibited.forEach(claim => {
      if (earnings_record.metadata && JSON.stringify(earnings_record.metadata).toLowerCase().includes(claim.toLowerCase())) {
        violations.push(`Prohibited claim detected: ${claim}`);
      }
    });

    return {
      compliant: violations.length === 0,
      violations,
      check_type: 'earnings_claim',
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Validate privacy and PII handling
   */
  validate_privacy(data_record) {
    const violations = [];

    // Check if PII present
    const text = JSON.stringify(data_record).toLowerCase();
    const pii_patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      ip_address: /\b(?:\d{1,3}\.){3}\d{1,3}\b/
    };

    Object.entries(pii_patterns).forEach(([pii_type, pattern]) => {
      if (pattern.test(text)) {
        violations.push(`PII detected: ${pii_type}`);
      }
    });

    // Check consent for PII
    if (violations.length > 0 && this.compliance_rules.privacy.consent_required_for_pii) {
      if (!data_record.pii_consent) {
        violations.push('PII detected but consent not provided');
      }
    }

    // Check encryption requirement
    if (!data_record.encrypted && violations.length > 0) {
      violations.push('PII present but data not marked as encrypted');
    }

    return {
      compliant: violations.length === 0,
      violations,
      check_type: 'privacy',
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Check content boundaries (from logistics API)
   */
  check_content_boundaries(request) {
    const violations = [];

    const boundary_rules = {
      no_real_partnerships: /\b(partnership|agreement|contract|signed)\b without evidence/i,
      no_government_status: /\b(government|official|approved|licensed)\b status/i,
      no_voting_claims: /\b(vote|voting|election|ballot|poll)\b/i,
      no_human_trafficking: /\b(trafficking|exploitation|abuse)\b/i,
      no_criminal_claims: /\b(fraud|illegal|criminal|theft)\b/i
    };

    const request_text = (request.summary + ' ' + request.details + ' ' + JSON.stringify(request.metadata || {})).toLowerCase();

    // Check if claim_level is symbolic/draft when boundaries might be violated
    if ((request.claim_level === 'approved_public_statement' || request.claim_level === 'verified') && 
        request_text.match(/partnership|government|voting|trafficking|criminal/i)) {
      violations.push('High-confidence claim level used with boundary-sensitive content. Requires evidence review.');
    }

    return {
      compliant: violations.length === 0,
      violations,
      check_type: 'content_boundaries',
      checked_at: new Date().toISOString()
    };
  }

  /**
   * Run full compliance audit
   */
  audit(request, request_type = 'general') {
    const checks = [];

    if (request_type === 'hotline_intake' || !request_type) {
      checks.push(this.validate_hotline_intake(request));
    }

    if (request_type === 'earnings_claim' || !request_type) {
      checks.push(this.validate_earnings_claim(request));
    }

    if (request_type === 'privacy' || !request_type) {
      checks.push(this.validate_privacy(request));
    }

    checks.push(this.check_content_boundaries(request));

    const all_compliant = checks.every(c => c.compliant);
    const all_violations = checks.flatMap(c => c.violations);

    return {
      audit_id: 'AUD-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
      audit_date: new Date().toISOString(),
      compliant: all_compliant,
      checks,
      all_violations,
      recommendation: all_compliant ? 'APPROVED' : 'REVIEW_REQUIRED'
    };
  }
}

module.exports = {
  ComplianceChecker
};
