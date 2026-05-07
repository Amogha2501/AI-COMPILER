const { SchemasContainer } = require('../schemas/definitions');
const { semanticValidation } = require('./semantic_validator');

/**
 * Stage 5: Validation Engine (Upgraded with Semantic Awareness)
 */
function validateOutputs(schemas, constraints, prompt = "", design = {}) {

  console.log(`[Stage 5: Validation Engine] Running explicit architectural + semantic checks...`);

  const errors = [];
  const checks = [];

  // 1. SEMANTIC VALIDATION
  const semanticResult = semanticValidation(prompt, design, schemas);
  if (
  semanticResult.status !== "success" &&
  semanticResult.status !== "underspecified"
) {
    errors.push({
      schema: "semantic",
      type: semanticResult.status,
      message: semanticResult.reason
    });
    checks.push(`Semantic Check: ${semanticResult.status.toUpperCase()}`);
  } else {
    checks.push("Semantic Check: PASSED");
  }

  // 2. ZOD STRUCTURAL CHECK
  const parseResult = SchemasContainer.safeParse(schemas);
  if (!parseResult.success) {
    parseResult.error.issues.forEach(e => {
      errors.push({
        schema: e.path[0] || 'unknown',
        message: e.message
      });
    });
  }

  // 3. UI → API MAPPING
  const uiPages = schemas.ui?.pages || [];
  const apiPaths = (schemas.api?.routes || []).map(r => r.path);

  const uiApiValid = uiPages.every(p =>
    (p.apiDependencies || []).every(d =>
      apiPaths.includes(d)
    )
  );
  checks.push(
    uiApiValid
      ? "UI-API mapping valid"
      : "UI-API mapping mismatch"
  );

  if (!uiApiValid) {
    errors.push({
      schema: "ui",
      message: "UI refers to non-existent API routes"
    });
  }

  // 4. API STRUCTURED VALIDATION
  const apiValidations = (schemas.api?.routes || []).flatMap(r => r.validation || []);
  const hasStructuredValidation = apiValidations.every(v => {

  if (!v) return false;

  return (
    typeof v === "object" &&
    typeof v.field === "string" &&
    (
      typeof v.type === "string" ||
      typeof v.constraint === "string"
    )
  );
});

  if (!hasStructuredValidation) {
    errors.push({
      schema: "api",
      message: "API validation structure invalid"
    });
  }

  // 5. DB CONSTRAINTS
  const dbFields = (schemas.db?.tables || []).flatMap(t => t.fields || []);
  const constraintInDb = Object.keys(constraints || {}).every(c =>
    dbFields.some(f =>
      f.name.toLowerCase().includes(c.toLowerCase()) &&
      (f.maxLength !== undefined || f.type)
    )
  );

  checks.push(
    constraintInDb
      ? "Constraint enforced in DB"
      : "Constraint missing in DB"
  );
  if(!constraintInDb){
    errors.push({
      schema: "db",
      message: "DB schema missing technical constraint limits"
    });
  } 

  // 6. AUTH CONSISTENCY
  const authValid = !!schemas.auth?.roles && schemas.auth.roles.length > 0;
  checks.push(
    authValid
      ? "Auth consistency valid"
      : "Auth invalid"
  );

  if (!authValid) {
    errors.push({
      schema: "auth",
      message: "Auth configuration invalid"
    });
  }

  const status = errors.length === 0 ? "passed" : "failed";

  return {
    status,
    valid: errors.length === 0,
    errors,
    checks,
    semantic: semanticResult
  };
}

module.exports = { validateOutputs };