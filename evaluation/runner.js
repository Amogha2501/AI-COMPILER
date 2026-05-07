const { DATASET } = require('./dataset');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Evaluation Runner
 * Executes the dataset against the compiler and generates metrics.
 */
async function runEvaluation() {
  console.log(`\x1b[35m=========================================\x1b[0m`);
  console.log(`\x1b[36m🚀 COMPILER EVALUATION RUNNER\x1b[0m`);
  console.log(`\x1b[35m=========================================\x1b[0m`);

  const results = [];
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

  for (const item of DATASET) {
    console.log(`\n[${item.id}] Running Category: ${item.category}`);
    console.log(`Prompt: "${item.prompt}"`);

    try {
      const start = Date.now();
      const response = await axios.post('http://localhost:3000/generate-app', {
        prompt: item.prompt
      });
      const latency = Date.now() - start;

      const data = response.data;
      const metrics = {
        id: item.id,
        category: item.category,
        success: data.success,
        latency_ms: latency,
        confidence: data.evaluation?.confidence_score || 0,
        semantic_status: data.evaluation?.semantic_status || 'unknown',
        retries: data.meta?.retries || 0,
        llm_calls: data.meta?.llm_calls || 0
      };

      results.push(metrics);
      console.log(`Result: ${metrics.success ? '✅ SUCCESS' : '⚠️ ABORTED/FAILED'} | Status: ${metrics.semantic_status} | Confidence: ${metrics.confidence}%`);

    } catch (err) {
      console.error(`[${item.id}] FAILED: ${err.message}`);
      results.push({
        id: item.id,
        category: item.category,
        success: false,
        error: err.message
      });
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    total_tests: results.length,
    success_rate: (results.filter(r => r.success).length / results.length) * 100,
    avg_latency: results.reduce((acc, r) => acc + (r.latency_ms || 0), 0) / results.length,
    category_metrics: {}
  };

  // Category breakdown
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(cat => {
    const catTests = results.filter(r => r.category === cat);
    summary.category_metrics[cat] = {
      success_count: catTests.filter(r => r.success).length,
      avg_confidence: catTests.reduce((acc, r) => acc + (r.confidence || 0), 0) / catTests.length
    };
  });

  const reportPath = path.join(reportsDir, `evaluation_report_${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ summary, results }, null, 2));

  console.log(`\n\x1b[32mEvaluation Finished! Report saved to: ${reportPath}\x1b[0m`);
}

// Check if running directly
if (require.main === module) {
  runEvaluation();
}

module.exports = { runEvaluation };
