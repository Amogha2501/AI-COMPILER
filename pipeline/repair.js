const {
  callLLM,
  safeParse,
  estimateTokens
} = require('./utils');

const {
  requestScopedRepairEngine
} = require('../semantic/requestScopedRepairEngine');

require('dotenv').config();

/**
 * SAFE CLONE
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

/**
 * SAFE TOKEN OBJECT
 */
function createUsage(total = 0) {
  return {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: total
  };
}

/**
 * STAGE 6 — REPAIR ENGINE
 */
async function repairSchemas(
  schemas,
  errors,
  design,
  repairContext = "",
  requestContext = null
) {

  console.log(
    `[Stage 6: Repair Engine] Attempting repair strategy...`
  );

  const repairedSchemas =
    deepClone(schemas);

  const fixed_modules = [];

  let usage = createUsage();

  /**
   * ====================================================
   * DETERMINISTIC REPAIR
   * ====================================================
   */
  if (requestContext) {

    console.log(
      `[Stage 6] Using request-scoped repair for request: ${requestContext.id}`
    );

    try {

      const deterministicSchemas =
        requestScopedRepairEngine({

          schemas: repairedSchemas,

          domain:
            requestContext.primaryDomain || "system",

          requestId:
            requestContext.id
        });

      ["ui", "api", "db", "logic", "auth"]
        .forEach(key => {

          if (deterministicSchemas[key]) {

            repairedSchemas[key] =
              deterministicSchemas[key];

            fixed_modules.push(
              `${key} (deterministic)`
            );
          }
        });

      console.log(
        `[Stage 6] Deterministic repair successful.`
      );

    } catch (err) {

      console.log(
        `[Stage 6] Deterministic repair failed: ${err.message}`
      );
    }
  }

  /**
   * ====================================================
   * STRUCTURAL FIXES
   * ====================================================
   */

  if (
    errors.some(e =>
      JSON.stringify(e)
        .toLowerCase()
        .includes("db")
    )
  ) {

    (repairedSchemas.db?.tables || [])
      .forEach(table => {

        (table.fields || [])
          .forEach(field => {

            if (
              field.maxLength === undefined &&
              field.type === "string"
            ) {

              field.maxLength = 255;
            }
          });
      });

    fixed_modules.push(
      "db constraints"
    );
  }

  /**
   * ====================================================
   * LLM REPAIR
   * ====================================================
   */

  const llmPrompt = `
Fix validation errors in software architecture schemas.

REPAIR CONTEXT:
${repairContext || "GENERAL"}

STRICT REQUIREMENTS:
- RETURN ONLY VALID JSON
- NO MARKDOWN
- NO COMMENTS

Schemas:
${JSON.stringify(repairedSchemas)}

Errors:
${JSON.stringify(errors)}

Return JSON:
{
  "data": {
    "ui": {},
    "api": {},
    "db": {},
    "auth": {},
    "logic": {}
  }
}
`;

  try {

    const generatedText =
      await callLLM(
        llmPrompt,
        { requestContext }
      );

    const result =
      safeParse(generatedText);

    if (result?.data) {

      ["ui", "api", "db", "auth", "logic"]
        .forEach(key => {

          /**
           * IGNORE EMPTY OBJECTS
           */
          if (
            !result.data[key] ||
            (
              typeof result.data[key] === "object" &&
              Object.keys(result.data[key]).length === 0
            )
          ) {

            return;
          }

          /**
           * UI SAFETY
           */
          if (
            key === "ui" &&
            (
              !Array.isArray(result.data.ui.pages) ||
              result.data.ui.pages.length === 0
            )
          ) {

            console.log(
              `[Stage 6] Ignoring invalid UI overwrite`
            );

            return;
          }

          /**
           * API SAFETY
           */
          if (
            key === "api" &&
            (
              !Array.isArray(result.data.api.routes) ||
              result.data.api.routes.length === 0
            )
          ) {

            console.log(
              `[Stage 6] Ignoring invalid API overwrite`
            );

            return;
          }

          /**
 * SAFE NON-DESTRUCTIVE MERGE
 */
if (!repairedSchemas[key]) {

  repairedSchemas[key] =
    result.data[key];

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}

/**
 * UI SAFE MERGE
 */
if (
  key === "ui" &&
  Array.isArray(result.data.ui?.pages) &&
  result.data.ui.pages.length > 0 &&
  (
    !repairedSchemas.ui?.pages ||
    repairedSchemas.ui.pages.length === 0
  )
) {

  repairedSchemas.ui =
    result.data.ui;

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}

/**
 * API SAFE MERGE
 */
if (
  key === "api" &&
  Array.isArray(result.data.api?.routes) &&
  result.data.api.routes.length > 0 &&
  (
    !repairedSchemas.api?.routes ||
    repairedSchemas.api.routes.length === 0
  )
) {

  repairedSchemas.api =
    result.data.api;

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}

/**
 * DB SAFE MERGE
 */
if (
  key === "db" &&
  Array.isArray(result.data.db?.tables) &&
  result.data.db.tables.length > 0 &&
  (
    !repairedSchemas.db?.tables ||
    repairedSchemas.db.tables.length === 0
  )
) {

  repairedSchemas.db =
    result.data.db;

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}

/**
 * AUTH SAFE MERGE
 */
if (
  key === "auth" &&
  result.data.auth &&
  Object.keys(result.data.auth).length > 0 &&
  (
    !repairedSchemas.auth ||
    Object.keys(repairedSchemas.auth).length === 0
  )
) {

  repairedSchemas.auth =
    result.data.auth;

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}

/**
 * LOGIC SAFE MERGE
 */
if (
  key === "logic" &&
  Array.isArray(result.data.logic?.rules) &&
  result.data.logic.rules.length > 0 &&
  (
    !repairedSchemas.logic?.rules ||
    repairedSchemas.logic.rules.length === 0
  )
) {

  repairedSchemas.logic =
    result.data.logic;

  if (
    !fixed_modules.includes(key)
  ) {

    fixed_modules.push(key);
  }

  return;
}
        });
    }

    usage =
      createUsage(
        estimateTokens(
          llmPrompt +
          (generatedText || "")
        )
      );

    console.log(
      `[Stage 6] LLM repair completed.`
    );

  } catch (err) {

    console.log(
      `[Stage 6] LLM Error: ${err.message}`
    );
  }

  /**
   * ====================================================
   * FINAL RESULT
   * ====================================================
   */

  return {

    data: repairedSchemas,

    repair: {
      triggered:
        fixed_modules.length > 0,

      fixed_modules,

      deterministic:
        fixed_modules.some(m =>
          m.includes("deterministic")
        ),

      requestScoped:
        !!requestContext,

      requestId:
        requestContext?.id || null
    },

    usage
  };
}

module.exports = {
  repairSchemas
};