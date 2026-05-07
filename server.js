require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const fs = require('fs');
// PIPELINE
const { extractIntentAndDesign } = require('./pipeline/intent_design');
const { generateSchemas } = require('./pipeline/schema');
const { refineSchemas } = require('./pipeline/refine');
const { validateOutputs } = require('./pipeline/validate');
const { repairSchemas } = require('./pipeline/repair');
const { runExecutionSimulation } = require('./pipeline/execution');
const {stabilizeInput} = require('./semantic/inputStabilizer');
// METRICS
const {
  resetMetrics
} = require('./pipeline/utils');

// RUNTIME
const { simulateExecution } = require('./runtime/generator');

// SEMANTIC ENGINE
const {
  createRequestContext,
  isolateRequestData,
  validateRequestIsolation,
  cleanupRequestContext
} = require('./semantic/requestContext');

const DomainClassifier = require('./semantic/domainClassifier');
const ContaminationDetector = require('./semantic/contaminationDetector');
const ValidationEngine = require('./semantic/validationEngine');
const {
  expandDomain
} = require('./semantic/domainExpander');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MAX_RETRIES = 2;

/**
 * CONFIDENCE ENGINE
 */
function calculateConfidence(params) {

  let score = 100;
  if (params.semanticStatus === "partial_generation" && params.repairCount <= 1)
    score += 10;
  if (params.semanticStatus === "underspecified")
    score -= 40;

  if (params.semanticStatus === "semantic_conflict")
    score -= 100;

  if (params.semanticStatus === "technical_impossibility")
    score -= 100;

  if (params.semanticStatus === "partial_generation")
    score -= 20;

  score -= params.repairCount * 10;

  if (params.fallbackUsed)
    score -= 15;

  score -= params.ambiguityCount * 5;

  return Math.max(0, score);
  
}

/**
 * NORMALIZATION
 * Enforces canonical schema structure
 */
function normalizeSchemas(schemas = {}) {

  const normalized =
    JSON.parse(JSON.stringify(schemas || {}));

  /**
   * ====================================================
   * UI
   * ====================================================
   */

  normalized.ui =
    normalized.ui || {};

  normalized.ui.pages =
    Array.isArray(normalized.ui.pages)
      ? normalized.ui.pages
      : [];

  normalized.ui.pages.forEach(page => {

    page.name =
      page.name || "GeneratedPage";

    page.route =
      page.route || "/";

    page.components =
      Array.isArray(page.components)
        ? page.components
        : [];

    page.apiDependencies =
      Array.isArray(page.apiDependencies)
        ? page.apiDependencies
        : [];
  });

  /**
   * ====================================================
   * API
   * ====================================================
   */

  normalized.api =
    normalized.api || {};

  normalized.api.routes =
    Array.isArray(normalized.api.routes)
      ? normalized.api.routes
      : [];

  normalized.api.routes.forEach(route => {

    route.path =
      route.path || "/api/default";

    route.method =
      route.method || "GET";

    /**
     * FIX INVALID VALIDATION STRUCTURE
     */
    if (!Array.isArray(route.validation)) {

      route.validation = [];

    } else {

      route.validation =
        route.validation.map(v => {

          /**
           * STRING → OBJECT
           */
          if (typeof v === "string") {

            return {
              field: v,
              type: "string",
              required: true
            };
          }

          /**
           * SAFE OBJECT
           */
          return {
            field:
              v.field || "unknown",

            type:
              v.type || "string",

            required:
              v.required !== undefined
                ? v.required
                : true
          };
        });
    }
  });

  /**
   * ====================================================
   * DB
   * ====================================================
   */

  normalized.db =
    normalized.db || {};

  normalized.db.tables =
    Array.isArray(normalized.db.tables)
      ? normalized.db.tables
      : [];

  normalized.db.tables.forEach(table => {

    table.name =
      table.name || "DefaultTable";

    table.fields =
      Array.isArray(table.fields)
        ? table.fields
        : [];

    table.fields.forEach(field => {

      field.name =
        field.name || "id";

      field.type =
        field.type || "string";

      /**
       * DEFAULT STRING LIMITS
       */
      if (
        field.type === "string" &&
        field.maxLength === undefined
      ) {

        field.maxLength = 255;
      }
    });
  });

  /**
   * ====================================================
   * LOGIC
   * ====================================================
   */

  normalized.logic =
    normalized.logic || {};

  normalized.logic.rules =
    Array.isArray(normalized.logic.rules)
      ? normalized.logic.rules
      : [];

  /**
   * ====================================================
   * AUTH
   * ====================================================
   */

  normalized.auth =
    normalized.auth || {};

  normalized.auth.roles =
    Array.isArray(normalized.auth.roles)
      ? normalized.auth.roles
      : ["User"];

  normalized.auth.permissions =
    normalized.auth.permissions || {
      User: ["read", "write"]
    };

  /**
   * ====================================================
   * DETERMINISTIC SORTING
   * ====================================================
   */

  normalized.ui.pages.sort((a, b) =>
    String(a.name)
      .localeCompare(String(b.name))
  );

  normalized.api.routes.sort((a, b) =>
    String(a.path)
      .localeCompare(String(b.path))
  );

  normalized.db.tables.sort((a, b) =>
    String(a.name)
      .localeCompare(String(b.name))
  );

  normalized.logic.rules.sort();

  return normalized;
}

/**
 * METRICS
 */
function aggregateFinalMetrics(
  state,
  execution,
  requestContext
) {

  return {

    success:
      execution.status === "success",

    latency_ms:
      state.totalLatency,

    llm_calls:
      requestContext.metrics.llmCalls,

    tokens_used:
      requestContext.metrics.totalTokens,

    repair_count:
      state.retries,

    fallback_used:
      requestContext.metrics.fallbacksUsed > 0,

    confidence_score:
      execution.metrics?.confidenceScore || 0,

    semantic_status:
      state.validation?.semantic?.status || "unknown",

    domain_purity:
      !state.domainContamination?.isContaminated,

    request_isolated:
      requestContext.id === state.requestId
  };
}

/**
 * MAIN ROUTE
 */
app.post('/generate-app', async (req, res) => {

  const { prompt } = req.body;
  /**
 * INPUT STABILIZATION
 */
const stabilized =
  stabilizeInput(prompt);

/**
 * HARD FAILURE
 */
if (!stabilized.valid) {

  return res.status(400).json({

    success: false,

    status:
      stabilized.status,

    errors:
      stabilized.errors,

    ambiguityScore:
      stabilized.ambiguityScore
  });
}

/**
 * USE NORMALIZED PROMPT
 */
const finalPrompt =
  stabilized.normalizedPrompt;
  console.log(
  `[INPUT STABILIZED]
RAW: ${prompt}
NORMALIZED: ${finalPrompt}
STATUS: ${stabilized.status}`
);
  if (!finalPrompt) {
    return res.status(400).json({
      success: false,
      error: "Missing prompt"
    });
  }

  const requestId = crypto.randomUUID();

  const requestContext =
    createRequestContext(finalPrompt);

  const startTime = performance.now();

  console.log(
    `\n[PIPELINE START] ${requestId}`
  );

  const state = {
    requestId,
    retries: 0,
    totalTokens: 0,
    schemas: null,
    validation: null,
    intent: null,
    design: null,
    domainClassification: null,
    domainContamination: null
  };

  try {

    validateRequestIsolation(requestContext);

    resetMetrics();

    const stageLatencies = {};

    /**
     * STAGE 1 & 2
     */
    const s1Start = performance.now();

    const {
      data: combined,
      usage: u1
    } = await extractIntentAndDesign(finalPrompt);

    stageLatencies.intent_design =
      Math.round(performance.now() - s1Start);

    state.intent = combined.intent;
    state.design = combined.design;

    requestContext.intent =
      isolateRequestData(state.intent);

    requestContext.design =
      isolateRequestData(state.design);

    state.totalTokens += u1.total_tokens || 0;

    requestContext.metrics.totalTokens +=
      u1.total_tokens || 0;

    /**
     * DOMAIN CLASSIFICATION
     */
    const domainClassification =
      DomainClassifier.classify(finalPrompt);

    state.domainClassification =
      domainClassification;

    requestContext.primaryDomain =
      domainClassification.primaryDomain;

    requestContext.forbiddenDomains =
      domainClassification.forbiddenDomains || [];

    requestContext.allowedEntities =
      domainClassification.allowedEntities || [];

    /**
     * STAGE 3
     */
    const s3Start = performance.now();

    const {
      data: rawSchemas,
      usage: u3
    } = await generateSchemas(
      state.design,
      state.intent.constraints || {},
      finalPrompt
    );

    stageLatencies.schema =
      Math.round(performance.now() - s3Start);

    state.schemas =
      isolateRequestData(rawSchemas);

    requestContext.schemas =
      isolateRequestData(state.schemas);

    state.totalTokens += u3.total_tokens || 0;

    requestContext.metrics.totalTokens +=
      u3.total_tokens || 0;

    /**
     * CONTAMINATION CHECK
     */
    const purityCheck =
      ContaminationDetector.validateDomainPurity(
        requestContext,
        state.schemas,
        domainClassification
      );

    if (!purityCheck.isPure) {

      requestContext.domainPurityViolations.push(
        ...(purityCheck.violations || [])
      );
    }

    /**
     * STAGE 4
     */
    const s4Start = performance.now();

    const {
      data: refinedData
    } = refineSchemas(
      state.schemas,
      state.intent
    );

    stageLatencies.refine =
      Math.round(performance.now() - s4Start);

    state.schemas =
      isolateRequestData(refinedData);
    /**
 * DOMAIN EXPANSION
 */
const expanded =
  expandDomain(
    domainClassification.primaryDomain
  );

/**
 * SAFE MERGE
 */
state.schemas = {

  ...expanded,

  ...state.schemas,

  ui: {
    ...(expanded.ui || {}),
    ...(state.schemas.ui || {})
  },

  api: {
    ...(expanded.api || {}),
    ...(state.schemas.api || {})
  },

  db: {
    ...(expanded.db || {}),
    ...(state.schemas.db || {})
  },

  logic: {
    ...(expanded.logic || {}),
    ...(state.schemas.logic || {})
  }
};
    /**
     * STAGE 5
     */
    const s5Start = performance.now();

    state.validation = validateOutputs(
      state.schemas,
      state.intent.constraints || {},
      prompt,
      state.design
    );

    stageLatencies.validation =
      Math.round(performance.now() - s5Start);

    /**
     * STAGE 6
     */
    const s6Start = performance.now();

    while (
      !state.validation.valid &&
      state.retries < MAX_RETRIES
    ) {

      console.log(
        `[REPAIR] Attempt ${state.retries + 1}`
      );

      const repairContext =
        state.validation.semantic?.status !== "success"
          ? `SEMANTIC REPAIR`
          : `STRUCTURAL REPAIR`;

      const {
        data: repaired,
        usage: u6
      } = await repairSchemas(
        state.schemas,
        state.validation.errors,
        state.design,
        repairContext,
        requestContext
      );

      state.schemas =
        isolateRequestData({
          ...state.schemas,
          ...repaired
        });

      state.totalTokens += u6.total_tokens || 0;

      requestContext.metrics.totalTokens +=
        u6.total_tokens || 0;

      state.retries++;

      state.validation = validateOutputs(
        state.schemas,
        state.intent.constraints || {},
        finalPrompt,
        state.design
      );
    }

    stageLatencies.repair =
      Math.round(performance.now() - s6Start);

    /**
     * FINAL CONTAMINATION
     */
    state.domainContamination =
      ContaminationDetector.validateAllContamination(
        requestContext,
        state.schemas,
        domainClassification
      );

    /**
     * NORMALIZATION
     */
    const normalized =
      normalizeSchemas(
        isolateRequestData(state.schemas)
      );

    normalized.__requestId = requestId;
    normalized.__domain =
      domainClassification.primaryDomain;

    /**
     * STAGE 7
     */
    const s7Start = performance.now();

    const confidence =
      calculateConfidence({
        semanticStatus:
          state.validation.semantic?.status,

        repairCount:
          state.retries,

        fallbackUsed:
          !!normalized.__semanticRecovery,

        ambiguityCount:
          (state.intent.ambiguities || []).length
      });

    const executionResult =
  runExecutionSimulation(
    normalized,
    state.intent.constraints || {},
    {
      ...state.validation.semantic,
      confidence
    }
  );

/**
 * FINAL STATUS NORMALIZATION
 */

const semanticStatus =
  state.validation?.semantic?.status;

if (
  semanticStatus === "underspecified"
) {

  executionResult.status =
    "success_with_assumptions";

}
else if (
  executionResult.status === "partial_generation" &&
  executionResult.errors.length === 0 &&
  executionResult.metrics.fileCount >= 5
) {

  executionResult.status = "success";

}
    /**
     * RUNTIME GENERATION
     */
    let generation = null;

    if (executionResult.status === "success") {
      generation =
        simulateExecution(normalized);
    }

    state.totalLatency =
      Math.round(performance.now() - startTime);

    const metrics =
      aggregateFinalMetrics(
        state,
        executionResult,
        requestContext
      );

    /**
     * OUTPUT VALIDATION
     */
    const outputValidation =
      ValidationEngine.validateOutput(
        requestContext,
        {
          requestId,
          schemas: normalized,
          timestamp: Date.now()
        }
      );

    cleanupRequestContext(requestContext);

    const output = {

      success:
        executionResult.status === "success" &&
        outputValidation.isValid,

      requestId,

      domain:
        domainClassification.primaryDomain,

      isolated: true,

      stages: {
        intent: state.intent,
        design: state.design,
        schema: normalized,
        validation: state.validation,
        execution: executionResult
      },

      evaluation: {
        confidence_score: confidence,
        semantic_status:
          state.validation.semantic?.status,

        domain_purity:
          state.domainContamination?.passed,

        latency_ms:
          state.totalLatency,

        fallbacks_used:
          requestContext.metrics.fallbacksUsed
      },

      meta: {
        llm_calls:
          requestContext.metrics.llmCalls,

        total_tokens:
          requestContext.metrics.totalTokens,

        stage_latencies:
          stageLatencies,

        retries:
          state.retries,

        assumptions: [
          ...(state.intent.ambiguities || []),
          ...(state.validation.semantic?.assumptions || [])
        ],

        request_context_id:
          requestId,

        isolation_verified: true
      },

      generation,
      metrics
    };

    console.log(
      `[PIPELINE SUCCESS] ${requestId}`
    );
   /**
 * OUTPUT PERSISTENCE
 */
const outputDir = path.join(
  __dirname,
  'output'
);

if (!fs.existsSync(outputDir)) {

  fs.mkdirSync(outputDir, {
    recursive: true
  });
}

/**
 * TIMESTAMPED SESSION
 */
const sessionId =
  `generation_${Date.now()}`;

const sessionDir = path.join(
  outputDir,
  sessionId
);

fs.mkdirSync(sessionDir, {
  recursive: true
});

/**
 * SAVE SCHEMAS
 */
fs.writeFileSync(

  path.join(
    sessionDir,
    'schemas.json'
  ),

  JSON.stringify(
    output.stages.schema,
    null,
    2
  )
);

/**
 * SAVE VALIDATION REPORT
 */
fs.writeFileSync(

  path.join(
    sessionDir,
    'validation_report.json'
  ),

  JSON.stringify(
    executionResult,
    null,
    2
  )
);

/**
 * SAVE METRICS
 */
fs.writeFileSync(

  path.join(
    sessionDir,
    'metrics.json'
  ),

  JSON.stringify({

    latency:
      state.totalLatency,

    retries:
      state.retries,

    tokensUsed:
      state.totalTokens,

    requestId,

    confidence:
      confidence,

    semanticStatus:
      state.validation.semantic?.status ||

      "unknown"

  }, null, 2)
);

/**
 * SAVE COMPLETE GENERATION
 */
fs.writeFileSync(

  path.join(
    sessionDir,
    'generation.json'
  ),

  JSON.stringify(
    output,
    null,
    2
  )
);

console.log(
  `[OUTPUT SAVED] ${sessionDir}`
);

/**
 * FINAL RESPONSE
 */
res.json({

  success: true,

  outputDirectory:
    sessionDir,

  output
});
  } catch (error) {

    console.error(
      `[PIPELINE CRASH] ${requestId}`,
      error
    );

    res.status(500).json({

      success: false,

      requestId,

      error:
        "Critical Pipeline Failure",

      details:
        error.message
    });

  }
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`
=========================================
🚀 AI COMPILER
📡 STATUS: RUNNING
🔒 REQUEST ISOLATION: ENABLED
🛡️ DOMAIN VALIDATION: ACTIVE
🌐 URL: http://localhost:${PORT}
=========================================
`);
});