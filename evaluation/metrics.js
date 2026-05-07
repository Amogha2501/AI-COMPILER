const fs = require('fs');
const path = require('path');
const { extractIntent } = require('../pipeline/intent');
const { createDesign } = require('../pipeline/design');
const { generateSchemas } = require('../pipeline/schema');
const { refineSchemas } = require('../pipeline/refine');
const { validateOutputs } = require('../pipeline/validate');
const { repairSchemas } = require('../pipeline/repair');
const { simulateExecution } = require('../runtime/generator');
require("dotenv").config({ path: "../.env" });
const MAX_RETRIES = 3;

function aggregateUsage(usages) {
  return usages.reduce((acc, curr) => {
    if (!curr) return acc;
    acc.prompt_tokens += curr.prompt_tokens || 0;
    acc.completion_tokens += curr.completion_tokens || 0;
    acc.total_tokens += curr.total_tokens || 0;
    return acc;
  }, { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });
}

async function runEvaluation() {
  const datasetPath = path.join(__dirname, 'dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const metrics = {
    total: dataset.length,
    successes: 0,
    failures: 0,
    totalRetries: 0,
    failureTypes: {},
    averageLatencyMs: 0,
    totalTokensUsed: 0,
    averageTokensPerPrompt: 0
  };

  let totalLatency = 0;

  console.log(`Starting evaluation on ${dataset.length} prompts...`);

  for (const item of dataset) {
    console.log(`\n--- Evaluating Prompt ID: ${item.id} (${item.type}) ---`);
    console.log(`Prompt: "${item.prompt}"`);
    
    const startTime = Date.now();
    let success = false;
    let retries = 0;
    const usages = [];

    try {
      // Run Pipeline
      const { data: intent, usage: intentUsage } = await extractIntent(item.prompt);
      usages.push(intentUsage);

      const { data: design, usage: designUsage } = await createDesign(intent);
      usages.push(designUsage);

      let { data: schemas, usage: schemaUsage } = await generateSchemas(design);
      usages.push(schemaUsage);

      const { data: refinedSchemas, usage: refineUsage } = await refineSchemas(schemas, intent);
      schemas = refinedSchemas;
      usages.push(refineUsage);
      
      let validationResult = validateOutputs(schemas);

      while (!validationResult.valid && retries < MAX_RETRIES) {
        console.log(`[Repair] Retrying... Attempt ${retries + 1}`);
        const { data: repairedSchemas, usage: repairUsage } = await repairSchemas(schemas, validationResult.errors, design);
        schemas = repairedSchemas;
        usages.push(repairUsage);

        validationResult = validateOutputs(schemas);
        retries++;
        metrics.totalRetries++;
      }

      if (!validationResult.valid) {
        throw new Error(`Validation failed after ${MAX_RETRIES} retries. Errors: ${validationResult.errors.map(e => `[${e.schema}] ${e.message}`).join(' | ')}`);
      }

      const executionResult = simulateExecution(schemas);
      if (!executionResult.success) {
        throw new Error(`Execution Simulation failed: ${executionResult.error}`);
      }

      success = true;
      metrics.successes++;
      console.log(`[Result] SUCCESS. Retries: ${retries}`);

    } catch (error) {
      metrics.failures++;
      console.log(`[Result] FAILED. Reason: ${error.message}`);
      
      const failureType = error.message.includes('Validation') ? 'Validation Failure' : 
                          error.message.includes('Execution') ? 'Execution Simulation Failure' : 'System Error';
      
      metrics.failureTypes[failureType] = (metrics.failureTypes[failureType] || 0) + 1;
    }

    const latency = Date.now() - startTime;
    totalLatency += latency;
    console.log(`Latency: ${latency}ms`);

    const promptUsage = aggregateUsage(usages);
    metrics.totalTokensUsed += promptUsage.total_tokens;
    console.log(`Tokens Used (this prompt): ${promptUsage.total_tokens}`);
  }

  metrics.averageLatencyMs = totalLatency / metrics.total;
  metrics.averageTokensPerPrompt = Math.round(metrics.totalTokensUsed / metrics.total);

  console.log(`\n=== Final Evaluation Metrics ===`);
  console.log(JSON.stringify(metrics, null, 2));

  console.log(`\n=== Cost vs Quality Tradeoff Analysis ===`);
  console.log(`- High Quality: Schema generation, validation, and repair guarantees valid outputs, but at the cost of higher latency (Avg: ${metrics.averageLatencyMs}ms) and API token cost (Avg: ${metrics.averageTokensPerPrompt} tokens/prompt).`);
  console.log(`- Reliability: The system uses retries (${metrics.totalRetries} total across the dataset) to repair failures, trading off time/cost for a higher success rate.`);
}

if (require.main === module) {
  runEvaluation().catch(console.error);
}

module.exports = { runEvaluation };
