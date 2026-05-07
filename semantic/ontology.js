/**
 * Architectural Ontology
 * Defines system models, data traits, and security paradigms.
 */
const ONTOLOGY = {
  models: {
    centralized: { triggers: ['centralized', 'monolith', 'single authority'], conflicts: ['decentralized'] },
    decentralized: { triggers: ['decentralized', 'p2p', 'distributed control'], conflicts: ['centralized'] },
    distributed: { triggers: ['distributed', 'global', 'replication'], traits: ['cap_theorem'] }
  },
  data: {
    immutable: { triggers: ['immutable', 'append-only', 'ledger'], conflicts: ['editable', 'mutable'] },
    mutable: { triggers: ['editable', 'updateable', 'crud'], conflicts: ['immutable'] }
  },
  security: {
    anonymous: { triggers: ['anonymous', 'no-id', 'privacy-first'], conflicts: ['kyc', 'verified'] },
    compliant: { triggers: ['kyc', 'aml', 'identity'], conflicts: ['anonymous'] }
  }
};

module.exports = ONTOLOGY;
