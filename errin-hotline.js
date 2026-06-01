/**
 * errin-hotline.js
 * Whistleblower hotline intake contract and intake logic.
 * Ensures consent, privacy, evidence tracking, and compliance boundaries.
 */

const crypto = require('crypto');

/**
 * HotlineIntakeRequest — structured contract for hotline calls
 */
class HotlineIntakeRequest {
  constructor(rawInput = {}) {
    this.intake_id = rawInput.intake_id || this.generateIntakeId();
    this.timestamp = new Date().toISOString();
    this.caller_consent = rawInput.caller_consent || false; // must be explicit
    this.caller_anonymity_requested = rawInput.caller_anonymity_requested || false;
    this.recording_consent = rawInput.recording_consent || false;
    this.subject_category = rawInput.subject_category || 'unspecified'; // e.g., 'integrity', 'compliance', 'operational'
    this.summary = rawInput.summary || '';
    this.details = rawInput.details || '';
    this.evidence_references = rawInput.evidence_references || [];
    this.urgency = rawInput.urgency || 'normal'; // 'normal', 'high', 'critical'
    this.intake_status = 'pending_review';
    this.intake_audit = [
      {
        when: this.timestamp,
        actor: 'system',
        action: 'intake_created',
        note: 'Hotline intake request initialized'
      }
    ];
  }

  generateIntakeId() {
    return 'HLI-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  /**
   * Validate intake for compliance and consent
   * Returns { valid, errors }
   */
  validate() {
    const errors = [];

    if (!this.caller_consent) {
      errors.push('Caller must explicitly consent to intake');
    }

    if (!this.subject_category || this.subject_category === 'unspecified') {
      errors.push('Subject category is required (integrity, compliance, operational, etc.)');
    }

    if (!this.summary || this.summary.trim().length < 10) {
      errors.push('Summary must be at least 10 characters');
    }

    if (this.recording_consent === null || this.recording_consent === undefined) {
      errors.push('Caller must explicitly consent or decline recording');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Lock intake for processing (no further edits)
   */
  lock() {
    this.intake_status = 'locked_for_review';
    this.intake_audit.push({
      when: new Date().toISOString(),
      actor: 'system',
      action: 'intake_locked',
      note: 'Intake locked and ready for review'
    });
    return this;
  }

  /**
   * Escalate to operator review
   */
  escalate(operator_id, reason = '') {
    this.intake_status = 'escalated_to_operator';
    this.intake_audit.push({
      when: new Date().toISOString(),
      actor: operator_id,
      action: 'escalated',
      note: reason || 'Escalated for operator review'
    });
    return this;
  }

  /**
   * Reject intake with reason
   */
  reject(reason = '') {
    this.intake_status = 'rejected';
    this.intake_audit.push({
      when: new Date().toISOString(),
      actor: 'system',
      action: 'rejected',
      note: reason || 'Intake rejected'
    });
    return this;
  }

  /**
   * Redact personally identifiable information
   */
  redact_pii() {
    const redacted = Object.assign({}, this);
    if (this.caller_anonymity_requested) {
      redacted.summary = this.summary.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
      redacted.details = this.details.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
      redacted.details = redacted.details.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
      redacted.details = redacted.details.replace(/\b\d{3}[-.]\d{3}[-.]\d{4}\b/g, '[PHONE]');
    }
    return redacted;
  }

  /**
   * Export as JSON for audit trail
   */
  toJSON() {
    return {
      intake_id: this.intake_id,
      timestamp: this.timestamp,
      caller_consent: this.caller_consent,
      caller_anonymity_requested: this.caller_anonymity_requested,
      recording_consent: this.recording_consent,
      subject_category: this.subject_category,
      summary: this.summary,
      details: this.details,
      evidence_references: this.evidence_references,
      urgency: this.urgency,
      intake_status: this.intake_status,
      intake_audit: this.intake_audit
    };
  }
}

/**
 * HotlineProcessor — manages intake queue and routing
 */
class HotlineProcessor {
  constructor() {
    this.intake_queue = [];
    this.processed_intakes = {};
    this.compliance_log = [];
  }

  /**
   * Receive and queue intake
   */
  receive_intake(rawInput) {
    const intake = new HotlineIntakeRequest(rawInput);
    const { valid, errors } = intake.validate();

    if (!valid) {
      intake.reject('Validation failed: ' + errors.join('; '));
      this.log_compliance_event('intake_rejected', intake.intake_id, errors);
      return { success: false, intake, errors };
    }

    intake.lock();
    this.intake_queue.push(intake);
    this.log_compliance_event('intake_received', intake.intake_id, [`Category: ${intake.subject_category}`, `Urgency: ${intake.urgency}`]);

    return { success: true, intake };
  }

  /**
   * Process next intake from queue
   */
  process_next() {
    if (this.intake_queue.length === 0) {
      return { success: false, message: 'No intakes in queue' };
    }

    const intake = this.intake_queue.shift();
    intake.escalate('processor', 'Routed to compliance review');
    this.processed_intakes[intake.intake_id] = intake;
    this.log_compliance_event('intake_processed', intake.intake_id, [`Status: ${intake.intake_status}`]);

    return { success: true, intake };
  }

  /**
   * Route intake to specific operator or escalation path
   */
  route_intake(intake_id, routing_target, reason = '') {
    const intake = this.processed_intakes[intake_id];
    if (!intake) {
      return { success: false, message: 'Intake not found' };
    }

    intake.intake_audit.push({
      when: new Date().toISOString(),
      actor: 'router',
      action: 'routed',
      note: `Routed to ${routing_target}: ${reason}`
    });

    this.log_compliance_event('intake_routed', intake_id, [`Target: ${routing_target}`, `Reason: ${reason}`]);

    return { success: true, intake, routing_target };
  }

  /**
   * Log compliance event (immutable)
   */
  log_compliance_event(event_type, intake_id, details = []) {
    this.compliance_log.push({
      when: new Date().toISOString(),
      event_type,
      intake_id,
      details
    });
  }

  /**
   * Get queue stats
   */
  get_stats() {
    return {
      pending_intakes: this.intake_queue.length,
      processed_intakes: Object.keys(this.processed_intakes).length,
      compliance_events: this.compliance_log.length,
      urgent_intakes: this.intake_queue.filter(i => i.urgency === 'critical').length
    };
  }
}

module.exports = {
  HotlineIntakeRequest,
  HotlineProcessor
};
