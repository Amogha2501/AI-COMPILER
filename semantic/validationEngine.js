function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function validateOutput(requestContext, output) {

  const errors = [];
  const warnings = [];

  /**
   * BASIC STRUCTURE
   */
  if (!output) {
    errors.push("Missing output object");
  }

  if (!output.schemas) {
    errors.push("Missing schemas");
  }

  /**
   * REQUEST ISOLATION
   */
  if (
    output.requestId &&
    requestContext.id &&
    output.requestId !== requestContext.id
  ) {

    errors.push(
      "Request isolation violation detected"
    );
  }

  /**
   * UI VALIDATION
   */
  const pages =
    safeArray(output.schemas?.ui?.pages);

  if (pages.length === 0) {
    warnings.push("No UI pages generated");
  }

  /**
   * API VALIDATION
   */
  const routes =
    safeArray(output.schemas?.api?.routes);

  if (routes.length === 0) {
    warnings.push("No API routes generated");
  }

  /**
   * DB VALIDATION
   */
  const tables =
    safeArray(output.schemas?.db?.tables);

  if (tables.length === 0) {
    warnings.push("No DB tables generated");
  }

  /**
   * DOMAIN PURITY
   */
  if (
    requestContext.domainPurityViolations &&
    requestContext.domainPurityViolations.length > 0
  ) {

    warnings.push(
      ...requestContext.domainPurityViolations
    );
  }

  /**
   * SEMANTIC STATUS VALIDATION
   */
  const semanticStatus =
    requestContext.semantic?.status;

  const allowedStatuses = [
    "success",
    "underspecified",
    "partial_generation",
    "semantic_conflict",
    "technical_impossibility",
    "warning",
    "failed"
  ];

  if (
    semanticStatus &&
    !allowedStatuses.includes(semanticStatus)
  ) {

    errors.push(
      `Invalid semantic status: ${semanticStatus}`
    );
  }

  /**
   * CONFIDENCE VALIDATION
   */
  const confidence =
    requestContext.metrics?.confidenceScore;

  if (
    confidence !== undefined &&
    (
      confidence < 0 ||
      confidence > 100
    )
  ) {

    errors.push(
      "Invalid confidence score"
    );
  }

  /**
   * FINAL RESULT
   */
  return {

    isValid:
      errors.length === 0,

    passed:
      errors.length === 0,

    errors,

    warnings,

    summary: {

      pageCount:
        pages.length,

      routeCount:
        routes.length,

      tableCount:
        tables.length,

      warningCount:
        warnings.length,

      errorCount:
        errors.length
    }
  };
}

module.exports = {
  validateOutput
};