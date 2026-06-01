/**
 * errin-teleprompter.js
 * Teleprompter AI script generation and live operator mode.
 * Provides AI-assisted scripts, prompt flow, and operator guidance.
 */

const crypto = require('crypto');

/**
 * TeleprompterScript — generated script for operator
 */
class TeleprompterScript {
  constructor(rawInput = {}) {
    this.script_id = rawInput.script_id || this.generateScriptId();
    this.created_at = new Date().toISOString();
    this.operator_id = rawInput.operator_id || 'unassigned';
    this.context = rawInput.context || 'general'; // 'hotline_intake', 'escalation', 'general'
    this.tone = rawInput.tone || 'professional'; // 'professional', 'empathetic', 'neutral'
    this.segments = rawInput.segments || [];
    this.cues = rawInput.cues || [];
    this.guidance_notes = rawInput.guidance_notes || [];
    this.script_status = 'draft';
    this.read_position = 0; // current position in script for live reading
  }

  generateScriptId() {
    return 'SCR-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  /**
   * Add a script segment (text block)
   */
  add_segment(text, segment_type = 'prompt') {
    const segment = {
      id: 'SEG-' + this.segments.length,
      text,
      segment_type, // 'prompt', 'pause', 'cue', 'feedback'
      added_at: new Date().toISOString()
    };
    this.segments.push(segment);
    return this;
  }

  /**
   * Add a visual or audio cue
   */
  add_cue(cue_text, cue_timing = 'before') {
    const cue = {
      id: 'CUE-' + this.cues.length,
      text: cue_text,
      timing: cue_timing, // 'before', 'during', 'after'
      timestamp: new Date().toISOString()
    };
    this.cues.push(cue);
    return this;
  }

  /**
   * Add operator guidance note
   */
  add_guidance(guidance_text) {
    this.guidance_notes.push({
      id: 'GDN-' + this.guidance_notes.length,
      text: guidance_text,
      added_at: new Date().toISOString()
    });
    return this;
  }

  /**
   * Finalize script for use
   */
  finalize() {
    this.script_status = 'finalized';
    return this;
  }

  /**
   * Start live reading mode
   */
  start_live_reading() {
    this.script_status = 'live';
    this.read_position = 0;
    return this;
  }

  /**
   * Advance to next segment
   */
  next_segment() {
    if (this.read_position < this.segments.length - 1) {
      this.read_position += 1;
      return this.segments[this.read_position];
    }
    return null;
  }

  /**
   * Get current segment
   */
  get_current_segment() {
    return this.segments[this.read_position] || null;
  }

  /**
   * Get all cues for current position
   */
  get_current_cues() {
    return this.cues.filter(c => c.timing === 'during' || c.timing === 'before');
  }

  /**
   * Export as JSON
   */
  toJSON() {
    return {
      script_id: this.script_id,
      created_at: this.created_at,
      operator_id: this.operator_id,
      context: this.context,
      tone: this.tone,
      segments: this.segments,
      cues: this.cues,
      guidance_notes: this.guidance_notes,
      script_status: this.script_status,
      read_position: this.read_position
    };
  }
}

/**
 * TeleprompterAI — generates scripts based on context
 */
class TeleprompterAI {
  constructor() {
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    return {
      hotline_intake: {
        opening: 'Thank you for calling. We are recording this call for quality and compliance purposes. Do you consent? [PAUSE for response]',
        identity: 'For our records, may I have your name or would you prefer to remain anonymous? [LISTEN]',
        category: 'What is the nature of your report? [OPTIONS: integrity, compliance, operational, other]',
        summary: 'Please provide a brief summary of your concern. [LISTEN up to 60 seconds]',
        details: 'Please provide additional details. [LISTEN]',
        evidence: 'Do you have any evidence or documentation? [YES/NO/UNSURE]',
        urgency: 'On a scale of 1-10, how urgent is this issue? [LISTEN]',
        contact: 'May we contact you with follow-up questions? If yes, how should we reach you? [LISTEN]',
        closing: 'Thank you for reporting this. We take all reports seriously. You will receive a reference number. [PROVIDE INTAKE_ID]'
      },
      escalation: {
        opening: 'This call is being escalated to a supervisor. Please remain on the line.',
        hold_message: 'Thank you for your patience. A supervisor will be with you shortly.',
        supervisor_intro: 'Hello, this is [OPERATOR_NAME], a supervisor. I have reviewed your case. [PAUSE]',
        case_summary: '[TELEPROMPTER DISPLAYS CASE SUMMARY] Let me confirm what we have on record...',
        action_plan: 'Here is what we will do next: [DISPLAY STEPS]',
        timeline: 'You can expect an update within [TIMELINE]. Your reference number is [INTAKE_ID].'
      },
      general: {
        greeting: 'Hello and welcome. How can I assist you today?',
        clarification: 'To better understand, could you elaborate on that? [LISTEN]',
        confirmation: 'Let me confirm what I heard: [REPEAT SUMMARY]. Is that correct? [YES/NO]',
        closing: 'Thank you for the information. Is there anything else I can help with?'
      }
    };
  }

  /**
   * Generate a script based on context and tone
   */
  generate_script(context = 'hotline_intake', tone = 'professional', operator_id = 'unassigned') {
    const script = new TeleprompterScript({
      context,
      tone,
      operator_id
    });

    const template = this.templates[context] || this.templates.general;

    // Build script from template
    Object.entries(template).forEach(([key, text]) => {
      script.add_segment(text, 'prompt');
      if (key === 'opening' || key === 'identity' || key === 'category') {
        script.add_cue('[OPERATOR: Listen carefully for caller response]', 'after');
      }
    });

    // Add tone-specific guidance
    if (tone === 'empathetic') {
      script.add_guidance('Use a warm, understanding tone. Acknowledge the caller\'s concern.');
      script.add_guidance('Avoid legal language; use simple, clear language.');
    } else if (tone === 'professional') {
      script.add_guidance('Maintain a neutral, professional tone.');
      script.add_guidance('Follow the script exactly; do not ad-lib.');
    }

    script.finalize();
    return script;
  }

  /**
   * Generate adaptive script based on caller response (simulated)
   */
  adapt_script(script, caller_response, response_type = 'escalation') {
    if (response_type === 'escalation') {
      script.add_segment('I understand this is urgent. I\'m escalating to a supervisor now.', 'prompt');
      script.add_cue('[OPERATOR: Transfer to supervisor queue]', 'after');
    } else if (response_type === 'confusion') {
      script.add_segment('Let me rephrase that for clarity...', 'prompt');
    }
    return script;
  }
}

/**
 * LiveOperatorMode — real-time operator control and display
 */
class LiveOperatorMode {
  constructor(operator_id = 'operator-1') {
    this.operator_id = operator_id;
    this.current_script = null;
    this.current_intake = null;
    this.live_session_id = 'SESSION-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    this.session_start = new Date().toISOString();
    this.session_log = [];
  }

  /**
   * Bind script and intake to live session
   */
  bind_script_and_intake(script, intake) {
    this.current_script = script;
    this.current_intake = intake;
    script.operator_id = this.operator_id;
    script.start_live_reading();
    this.log_session_event('session_started', `Script: ${script.script_id}, Intake: ${intake.intake_id}`);
    return this;
  }

  /**
   * Display current prompt to operator
   */
  display_prompt() {
    const segment = this.current_script.get_current_segment();
    const cues = this.current_script.get_current_cues();
    return {
      prompt: segment ? segment.text : 'End of script',
      cues,
      position: `${this.current_script.read_position} / ${this.current_script.segments.length}`,
      guidance: this.current_script.guidance_notes
    };
  }

  /**
   * Advance to next prompt
   */
  advance_prompt() {
    const next = this.current_script.next_segment();
    this.log_session_event('prompt_advanced', next ? next.id : 'end_of_script');
    return this.display_prompt();
  }

  /**
   * Log caller response during live session
   */
  log_caller_response(response_text, response_type = 'answer') {
    this.session_log.push({
      timestamp: new Date().toISOString(),
      response_type, // 'answer', 'clarification', 'escalation_request'
      text: response_text,
      segment_id: this.current_script.get_current_segment()?.id
    });
    return this;
  }

  /**
   * Log operator action
   */
  log_operator_action(action, details = '') {
    this.session_log.push({
      timestamp: new Date().toISOString(),
      actor: this.operator_id,
      action,
      details
    });
    return this;
  }

  /**
   * Log session event
   */
  log_session_event(event_type, details = '') {
    this.session_log.push({
      timestamp: new Date().toISOString(),
      event_type,
      details
    });
  }

  /**
   * End live session
   */
  end_session() {
    this.log_session_event('session_ended', `Duration: ${new Date() - new Date(this.session_start)}ms`);
    return {
      session_id: this.live_session_id,
      session_start: this.session_start,
      session_end: new Date().toISOString(),
      intake_id: this.current_intake.intake_id,
      session_log: this.session_log
    };
  }

  /**
   * Export session for audit
   */
  toJSON() {
    return {
      live_session_id: this.live_session_id,
      operator_id: this.operator_id,
      session_start: this.session_start,
      script_id: this.current_script?.script_id,
      intake_id: this.current_intake?.intake_id,
      session_log: this.session_log
    };
  }
}

module.exports = {
  TeleprompterScript,
  TeleprompterAI,
  LiveOperatorMode
};
