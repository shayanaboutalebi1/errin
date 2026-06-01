/**
 * errin-earnings.js
 * Evidence-gated live earnings display module.
 * Distinguishes between symbolic/projected, estimated, and verified earned amounts.
 */

const crypto = require('crypto');

/**
 * EarningsRecord — structured earnings entry with evidence requirements
 */
class EarningsRecord {
  constructor(rawInput = {}) {
    this.record_id = rawInput.record_id || this.generateRecordId();
    this.created_at = new Date().toISOString();
    this.campaign_id = rawInput.campaign_id || 'unknown';
    this.campaign_name = rawInput.campaign_name || 'Unnamed Campaign';
    this.claim_level = rawInput.claim_level || 'symbolic'; // 'symbolic', 'estimated', 'verified'
    this.currency = rawInput.currency || 'USD';
    this.amount = rawInput.amount || 0;
    this.evidence_status = rawInput.evidence_status || 'none'; // 'none', 'pending', 'verified'
    this.evidence_references = rawInput.evidence_references || [];
    this.source = rawInput.source || 'unknown'; // 'DeepMesh', 'manual_entry', 'automated_sync'
    this.responsible_party = rawInput.responsible_party || 'unspecified';
    this.earnings_audit = [
      {
        when: this.created_at,
        actor: 'system',
        action: 'record_created',
        note: `Earnings record created. Claim level: ${this.claim_level}`
      }
    ];
    this.metadata = rawInput.metadata || {};
  }

  generateRecordId() {
    return 'ERN-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  /**
   * Display earnings based on claim_level
   * Returns display value appropriate to evidence level
   */
  get_display_value() {
    if (this.claim_level === 'symbolic') {
      return {
        display: `${this.amount} ${this.currency} (symbolic)`,
        value: this.amount,
        confidence: 0,
        note: 'Symbolic/projected value. Not verified earnings.'
      };
    } else if (this.claim_level === 'estimated') {
      return {
        display: `~${this.amount} ${this.currency} (estimated)`,
        value: this.amount,
        confidence: 0.5,
        note: 'Estimated based on available data. Subject to verification.'
      };
    } else if (this.claim_level === 'verified') {
      if (this.evidence_status !== 'verified') {
        return {
          display: `${this.amount} ${this.currency} (verification pending)`,
          value: this.amount,
          confidence: 0.7,
          note: 'Claimed as verified but evidence not yet approved.'
        };
      }
      return {
        display: `${this.amount} ${this.currency} (verified)`,
        value: this.amount,
        confidence: 1.0,
        note: 'Verified earnings with supporting evidence.'
      };
    }
    return {
      display: '0 USD (unknown)',
      value: 0,
      confidence: 0,
      note: 'Claim level not recognized.'
    };
  }

  /**
   * Add evidence reference
   */
  add_evidence(evidence_reference, evidence_type = 'document') {
    this.evidence_references.push({
      id: 'EVD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      reference: evidence_reference,
      type: evidence_type, // 'document', 'receipt', 'contract', 'audit_log', 'other'
      added_at: new Date().toISOString()
    });
    return this;
  }

  /**
   * Verify evidence and update claim level
   */
  verify_evidence(verifying_party = 'system', approval_notes = '') {
    if (this.evidence_references.length === 0) {
      this.earnings_audit.push({
        when: new Date().toISOString(),
        actor: verifying_party,
        action: 'verification_attempted',
        note: 'Verification failed: no evidence references'
      });
      return { success: false, message: 'No evidence to verify' };
    }

    this.evidence_status = 'verified';
    this.claim_level = 'verified';
    this.earnings_audit.push({
      when: new Date().toISOString(),
      actor: verifying_party,
      action: 'evidence_verified',
      note: approval_notes || 'Evidence verified and claim updated to verified status'
    });
    return { success: true, message: 'Evidence verified', earnings_record: this };
  }

  /**
   * Dispute earnings claim
   */
  dispute(disputing_party = 'unknown', dispute_reason = '') {
    this.earnings_audit.push({
      when: new Date().toISOString(),
      actor: disputing_party,
      action: 'disputed',
      note: `Dispute raised: ${dispute_reason}`
    });
    this.claim_level = 'disputed';
    return this;
  }

  /**
   * Export for audit
   */
  toJSON() {
    return {
      record_id: this.record_id,
      created_at: this.created_at,
      campaign_id: this.campaign_id,
      campaign_name: this.campaign_name,
      claim_level: this.claim_level,
      currency: this.currency,
      amount: this.amount,
      evidence_status: this.evidence_status,
      evidence_references: this.evidence_references,
      source: this.source,
      responsible_party: this.responsible_party,
      earnings_audit: this.earnings_audit,
      display_value: this.get_display_value()
    };
  }
}

/**
 * EarningsLedger — aggregate earnings tracking and display
 */
class EarningsLedger {
  constructor() {
    this.records = {}; // record_id -> EarningsRecord
    this.index_by_campaign = {}; // campaign_id -> [record_ids]
    this.ledger_audit = [];
  }

  /**
   * Add earnings record to ledger
   */
  add_record(earnings_record) {
    this.records[earnings_record.record_id] = earnings_record;
    if (!this.index_by_campaign[earnings_record.campaign_id]) {
      this.index_by_campaign[earnings_record.campaign_id] = [];
    }
    this.index_by_campaign[earnings_record.campaign_id].push(earnings_record.record_id);
    this.log_ledger_event('record_added', earnings_record.record_id);
    return this;
  }

  /**
   * Get total earnings by claim_level
   */
  get_totals_by_level() {
    const totals = {
      symbolic: 0,
      estimated: 0,
      verified: 0,
      disputed: 0
    };
    Object.values(this.records).forEach(record => {
      const level = record.claim_level;
      if (totals.hasOwnProperty(level)) {
        totals[level] += record.amount;
      }
    });
    return totals;
  }

  /**
   * Get display summary for live dashboard
   */
  get_display_summary() {
    const totals = this.get_totals_by_level();
    return {
      verified_earnings: {
        amount: totals.verified,
        display: `${totals.verified} USD (verified)`,
        confidence: 1.0
      },
      estimated_earnings: {
        amount: totals.estimated,
        display: `~${totals.estimated} USD (estimated)`,
        confidence: 0.5
      },
      symbolic_earnings: {
        amount: totals.symbolic,
        display: `${totals.symbolic} USD (symbolic)`,
        confidence: 0
      },
      disputed_earnings: {
        amount: totals.disputed,
        display: `${totals.disputed} USD (disputed)`,
        confidence: 0
      },
      total_verified: totals.verified,
      total_all: Object.values(totals).reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Get records for campaign
   */
  get_records_for_campaign(campaign_id) {
    const record_ids = this.index_by_campaign[campaign_id] || [];
    return record_ids.map(id => this.records[id]);
  }

  /**
   * Verify all records for campaign
   */
  verify_campaign(campaign_id, verifying_party = 'system') {
    const records = this.get_records_for_campaign(campaign_id);
    const results = records.map(r => r.verify_evidence(verifying_party));
    this.log_ledger_event('campaign_verified', campaign_id, results.length);
    return results;
  }

  /**
   * Log ledger event (immutable)
   */
  log_ledger_event(event_type, event_target = '', details = '') {
    this.ledger_audit.push({
      when: new Date().toISOString(),
      event_type,
      event_target,
      details
    });
  }

  /**
   * Export full ledger for audit
   */
  toJSON() {
    return {
      records: Object.values(this.records).map(r => r.toJSON()),
      summary: this.get_display_summary(),
      ledger_audit: this.ledger_audit
    };
  }
}

module.exports = {
  EarningsRecord,
  EarningsLedger
};
