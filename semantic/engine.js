/**
 * Semantic Architecture Ontology
 * Defines architectural concepts and their relationships.
 */
const ONTOLOGY = {
  models: {
    centralized: {
      conflicts: ['decentralized', 'p2p', 'distributed_control'],
      requires: ['authority_node']
    },
    decentralized: {
      conflicts: ['centralized', 'hierarchical_control'],
      requires: ['consensus_mechanism', 'p2p_network']
    },
    distributed: {
      traits: ['cap_theorem_sensitive', 'latency_prone']
    }
  },
  data: {
    immutable: {
      conflicts: ['directly_editable', 'mutable_state'],
      suggests: ['event_sourcing', 'append_only_log']
    },
    relational: {
      traits: ['acid_compliant', 'structured']
    },
    document: {
      traits: ['schema_less', 'scalable']
    }
  },
  security: {
    anonymous: {
      conflicts: ['kyc_compliant', 'identity_verified'],
      suggests: ['zk_proofs']
    },
    rbac: {
      requires: ['user_roles', 'permissions']
    }
  },
  performance: {
    zero_latency: {
      constraints: ['physical_impossibility_for_distributed'],
      max_confidence: 10
    }
  }
};

/**
 * Contradiction Engine
 * Analyzes architectural intent for logical conflicts.
 */
function analyzeContradictions(design, intent) {
  const conflicts = [];
  const text = (intent.prompt || "").toLowerCase();

  // Rule 1: Control Conflicts
  if (text.includes('decentralized') && text.includes('centralized')) {
    conflicts.push({
      type: "CONTROL_CONFLICT",
      description: "Decentralized architecture conflicts with centralized control requirements.",
      severity: "CRITICAL",
      suggestion: "Use a Federated / Hybrid model."
    });
  }

  // Rule 2: State Conflicts
  if (text.includes('immutable') && (text.includes('edit') || text.includes('update'))) {
    conflicts.push({
      type: "STATE_CONFLICT",
      description: "Immutable data models cannot support direct record updates.",
      severity: "CRITICAL",
      suggestion: "Implement an Event-Sourcing pattern with a read-only projection."
    });
  }

  // Rule 3: Compliance Conflicts
  if (text.includes('anonymous') && text.includes('kyc')) {
    conflicts.push({
      type: "COMPLIANCE_CONFLICT",
      description: "KYC compliance requires identity verification, which violates anonymity.",
      severity: "CRITICAL",
      suggestion: "Use Zero-Knowledge Proofs for private identity verification."
    });
  }

  // Rule 4: Performance Physics
  if (text.includes('zero latency') && (text.includes('global') || text.includes('distributed'))) {
    conflicts.push({
      type: "PHYSICS_VIOLATION",
      description: "Zero latency is physically impossible in a global distributed system.",
      severity: "WARNING",
      suggestion: "Use Edge Computing and regional data sharding."
    });
  }

  return conflicts;
}

module.exports = { analyzeContradictions, ONTOLOGY };
