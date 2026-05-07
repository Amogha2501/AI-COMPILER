const ONTOLOGY = require('./ontology');

/**
 * Contradiction Engine
 * Analyzes architectural design for logical and technical conflicts.
 */
function analyzeContradictions(design, intent) {
  const conflicts = [];
  const text = (intent.prompt || "").toLowerCase();

  // 1. Control Conflicts
  if (text.includes('decentralized') && text.includes('centralized')) {
    conflicts.push({
      type: "CONTROL_CONFLICT",
      description: "Decentralized architecture is logically incompatible with centralized control requirements.",
      severity: "CRITICAL"
    });
  }

  // 2. Data State Conflicts
  if (text.includes('immutable') && (text.includes('edit') || text.includes('update'))) {
    conflicts.push({
      type: "STATE_CONFLICT",
      description: "Immutable data models cannot support mutable 'edit' operations.",
      severity: "CRITICAL"
    });
  }

  // 3. Security Conflicts
  if (text.includes('anonymous') && text.includes('kyc')) {
    conflicts.push({
      type: "SECURITY_CONFLICT",
      description: "Anonymity requirements violate KYC (Know Your Customer) compliance mandates.",
      severity: "CRITICAL"
    });
  }

  // 4. Performance Physics
  if (text.includes('zero latency') && (text.includes('global') || text.includes('distributed'))) {
    conflicts.push({
      type: "PHYSICS_VIOLATION",
      description: "Zero latency is physically impossible in a global distributed system due to speed of light constraints.",
      severity: "WARNING"
    });
  }

  return conflicts;
}

module.exports = { analyzeContradictions };
