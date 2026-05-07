const { analyzeContradictions } = require('../semantic/contradictionEngine');
const CONSTRAINTS = require('../semantic/constraints');

/**
 * Stage 5.5: Semantic Validation Layer (Production Grade)
 * Detects logical contradictions, impossible architectures, and vague prompts.
 */
function semanticValidation(prompt, design, schemas) {

  const text = (prompt || "").toLowerCase().trim();

  const results = {
    status: "success",
    conflicts: [],
    assumptions: [],
    confidence: 100,
    reason: ""
  };

  /**
   * 1. UNIVERSAL VAGUE INPUT DETECTION
   */
  const vaguePatterns = [
    /^app\.?$/i,
    /^website\.?$/i,
    /^system\.?$/i,
    /^platform\.?$/i,
    /^dashboard\.?$/i,
    /^portal\.?$/i,
    /^tool\.?$/i,
    /^software\.?$/i,
    /^application\.?$/i,
    /^crud app\.?$/i,
    /^mobile app\.?$/i
  ];

  const wordCount = text.split(/\s+/).length;

  const isVague =
    wordCount <= 2 ||
    vaguePatterns.some(p => p.test(text));

  if (isVague) {
    results.status = "underspecified";
    results.assumptions.push(
      "Prompt too vague for reliable architecture generation."
    );
    results.confidence = 40;
  }

  /**
   * 2. CONTRADICTION ENGINE
   */
  const conflicts = analyzeContradictions(design, { prompt });

  if (conflicts.length > 0) {
    results.status = "semantic_conflict";
    results.conflicts = conflicts;
    results.reason = conflicts[0].description;
    results.confidence = 0;
    return results;
  }

  /**
   * 3. TECHNICAL IMPOSSIBILITIES
   */
  if (text.includes('negative primary key')) {
    results.status = "technical_impossibility";
    results.reason =
      "Engineering violation: Primary keys must be non-negative.";
    results.confidence = 0;
    return results;
  }

  if (
    text.includes('infinite storage') &&
    text.includes('local ram')
  ) {
    results.status = "technical_impossibility";
    results.reason =
      `Resource violation: Local RAM is limited to ${CONSTRAINTS.tier_limits.mobile.max_ram_gb}GB.`;

    results.confidence = 0;
    return results;
  }

  /**
   * 4. PARTIAL GENERATION INFERENCE
   */
  const commonConcepts = [
    'auth',
    'user',
    'login',
    'dashboard',
    'api',
    'database',
    'table',
    'page'
  ];

  const conceptCount =
    commonConcepts.filter(c => text.includes(c)).length;

  if (
    conceptCount < 2 &&
    results.status !== "underspecified"
  ) {

    results.status = "partial_generation";

    results.assumptions.push(
      "Inferred missing architectural dependencies from domain context."
    );

    results.confidence = 70;
  }

  return results;
}

module.exports = { semanticValidation };