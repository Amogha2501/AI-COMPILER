/**
 * SAFE TEXT
 */
function normalizeText(text = "") {

  return String(text)
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * GARBAGE DETECTION
 */
function isGarbage(text = "") {

  const cleaned =
    text.replace(/[^a-zA-Z]/g, "");

  if (cleaned.length < 3)
    return true;

  const vowels =
    cleaned.match(/[aeiou]/gi) || [];

  return vowels.length === 0;
}

/**
 * IMPOSSIBLE SYSTEM DETECTION
 */
function detectImpossiblePatterns(text = "") {

  const lower =
    text.toLowerCase();

  const impossiblePatterns = [

    {
      pattern:
        "zero latency",

      reason:
        "Distributed systems cannot guarantee zero latency"
    },

    {
      pattern:
        "infinite storage",

      reason:
        "Infinite storage is physically impossible"
    },

    {
      pattern:
        "anonymous kyc",

      reason:
        "KYC requires identity verification"
    },

    {
      pattern:
        "immutable editable",

      reason:
        "Immutable systems cannot be editable"
    },

    {
      pattern:
        "decentralized centrally controlled",

      reason:
        "System cannot be decentralized and centrally controlled simultaneously"
    }
  ];

  return impossiblePatterns.filter(p =>
    lower.includes(p.pattern)
  );
}

/**
 * MAIN STABILIZER
 */
function stabilizeInput(prompt = "") {

  const normalized =
    normalizeText(prompt);

  /**
   * EMPTY INPUT
   */
  if (!normalized) {

    return {

      valid: false,

      status: "invalid_input",

      normalizedPrompt: null,

      assumptions: [],

      ambiguityScore: 100,

      errors: [
        "Empty prompt"
      ]
    };
  }

  /**
   * GARBAGE INPUT
   */
  if (isGarbage(normalized)) {

    return {

      valid: false,

      status: "nonsensical_input",

      normalizedPrompt: null,

      assumptions: [],

      ambiguityScore: 100,

      errors: [
        "Prompt appears nonsensical"
      ]
    };
  }

  /**
   * IMPOSSIBLE SYSTEMS
   */
  const impossible =
    detectImpossiblePatterns(
      normalized
    );

  if (impossible.length > 0) {

    return {

      valid: false,

      status:
        "technical_impossibility",

      normalizedPrompt:
        normalized,

      assumptions: [],

      ambiguityScore: 0,

      errors:
        impossible.map(i => i.reason)
    };
  }

  /**
   * VAGUE INPUTS
   */
  const vagueInputs = [
    "app",
    "website",
    "platform",
    "system",
    "dashboard"
  ];

  if (
    vagueInputs.includes(
      normalized.toLowerCase()
    )
  ) {

    return {

      valid: true,

      status: "underspecified",

      normalizedPrompt:
        "generic web application",

      assumptions: [

        "Assumed web application",

        "Assumed CRUD architecture",

        "Assumed frontend/backend system"
      ],

      ambiguityScore: 80,

      errors: []
    };
  }

  /**
   * NORMAL INPUT
   */
  return {

    valid: true,

    status: "processable",

    normalizedPrompt:
      normalized,

    assumptions: [],

    ambiguityScore: 0,

    errors: []
  };
}

module.exports = {
  stabilizeInput
};