const crypto = require("crypto");

/**
 * Deep clone helper to enforce strict request isolation
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

/**
 * Create a fully isolated request context
 */
function createRequestContext(prompt = "") {

  const requestId = crypto.randomUUID();

  return {

    // CORE REQUEST INFO
    id: requestId,
    prompt,
    createdAt: new Date().toISOString(),

    // DOMAIN STATE
    primaryDomain: null,
    forbiddenDomains: [],
    allowedEntities: [],

    // PIPELINE STATE
    intent: null,
    design: null,

    schemas: {
      ui: {},
      api: {},
      db: {},
      auth: {},
      logic: {}
    },

    // SEMANTIC ENGINE
    semantic: {
      status: "pending",
      conflicts: [],
      assumptions: [],
      ambiguityScore: 0
    },

    // VALIDATION
    validation: {
      structural: {
        passed: false,
        errors: []
      },

      semantic: {
        passed: false,
        errors: []
      },

      execution: {
        passed: false,
        errors: []
      }
    },

    // REPAIR ENGINE
    repair: {
      attempts: 0,
      repairedModules: [],
      repairHistory: []
    },

    // EXECUTION ENGINE
    execution: {
      status: "pending",
      validated: [],
      errors: []
    },

    // CONTAMINATION TRACKING
    contamination: {
      detected: false,
      violations: []
    },

    // DOMAIN PURITY
    domainPurityViolations: [],

    // METRICS
    metrics: {
      llmCalls: 0,
      retries: 0,
      latency: 0,
      fallbackUsed: false,
      confidenceScore: 0,
      totalTokens: 0,
      fallbacksUsed: 0
    }
  };
}

/**
 * Hard request isolation
 */
function isolateRequestData(data) {
  return deepClone(data);
}

/**
 * Validate request isolation
 */
function validateRequestIsolation(context) {

  if (!context) {
    throw new Error("Missing request context");
  }

  if (!context.id) {
    throw new Error("Request context missing ID");
  }

  return true;
}

/**
 * Cleanup request context
 */
function cleanupRequestContext(context) {

  if (!context) return;

  context.intent = null;
  context.design = null;
  context.schemas = null;

  context.semantic = null;
  context.validation = null;
  context.execution = null;

  context.repair = null;
  context.contamination = null;

  return true;
}

module.exports = {
  createRequestContext,
  isolateRequestData,
  validateRequestIsolation,
  cleanupRequestContext
};