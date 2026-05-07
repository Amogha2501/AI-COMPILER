const OpenAI = require('openai');

/**
 * DEPRECATED: Global metrics tracking
 * REPLACED with RequestContext metrics
 * Keeping for backward compatibility only
 * ALL NEW CODE should use RequestContext.metrics
 */
let globalLLMCalls = 0;
let globalFallbacksUsed = 0;

/**
 * Exponential Backoff Sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Strict JSON Extraction
 */
function extractJson(text) {
  if (!text) return null;

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) return null;

  const jsonCandidate = text.substring(first, last + 1);

  try {
    return JSON.parse(jsonCandidate);
  } catch (err) {
    // Try cleaning common issues like trailing commas
    try {
      const cleaned = jsonCandidate
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');
      return JSON.parse(cleaned);
    } catch (innerErr) {
      console.error("JSON PARSE FAILED:", err.message);
      return null;
    }
  }
}

/**
 * Robust JSON Extraction & Cleaning (Updated)
 */
function robustSafeParse(text) {
  return extractJson(text);
}

/**
 * Calls Groq API using OpenAI SDK with fallback and retry logic
 * UPDATED: Accepts requestContext for per-request metrics tracking
 */
async function callGroq(prompt, retries = 3, requestContext = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_groq_key')) {
    throw new Error("Missing or invalid GROQ_API_KEY in .env file.");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  let currentModel ="llama-3.1-8b-instant";
  const fallbackModel = "llama3-8b-8192";
  let fallbackUsed = false;

  for (let i = 0; i < retries; i++) {
    try {
      // Update request-scoped metrics (not global)
      if (requestContext && requestContext.metrics) {
        requestContext.metrics.llmCalls++;
      }
      // Keep legacy global for backward compatibility
      globalLLMCalls++;

      const chatCompletion =
  await client.chat.completions.create({

    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],

    model: currentModel,

    temperature: 0.1,

    max_tokens: 1800,

    top_p: 0.9
  });

console.log(
  "[TOKENS USED]",
  chatCompletion.usage
);

      // Track token usage
      const usage = chatCompletion.usage?.total_tokens || 0;
      if (requestContext && requestContext.metrics) {
        requestContext.metrics.totalTokens += usage;
      }

      return chatCompletion.choices[0].message.content;
    } catch (err) {
      // Automatic Fallback on rate limit or overload
      if (currentModel === "llama-3.3-70b-versatile" && (err.status === 429 || err.status === 503 || err.status === 413)) {
        console.warn(`[LLM] Groq Primary failed (${err.status}). Falling back to ${fallbackModel}.`);
        currentModel = fallbackModel;
        
        // Update request-scoped metrics
        if (requestContext && requestContext.metrics) {
          requestContext.metrics.fallbacksUsed++;
        }
        // Keep legacy global for backward compatibility
        globalFallbacksUsed++;
        fallbackUsed = true;

        i--; // Attempt fallback immediately without losing a retry slot
        continue;
      }

      if ((err.status === 429 || err.status === 503) && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`[LLM] Groq ${err.status}. Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Generic LLM Caller (Migrated to Groq)
 * UPDATED: Accepts requestContext for per-request metrics
 */
async function callLLM(prompt, options = {}) {
  // Extract requestContext from options if provided
  const requestContext = options.requestContext || null;
  // We ignore options.provider as Groq is now the mandatory provider
  return await callGroq(prompt, 3, requestContext);
}

/**
 * Legacy safeParse
 */
function safeParse(text) {
  return robustSafeParse(text);
}

/**
 * Estimated token usage
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * DEPRECATED: Use requestContext.metrics.llmCalls instead
 * Kept for backward compatibility
 */
function getLLMCallCount() {
  return globalLLMCalls;
}

/**
 * DEPRECATED: Use requestContext.metrics.fallbacksUsed instead
 * Kept for backward compatibility
 */
function getFallbacksUsed() {
  return globalFallbacksUsed;
}

/**
 * DEPRECATED: No longer needed with request-scoped metrics
 * Kept for backward compatibility
 */
function resetMetrics() {
  globalLLMCalls = 0;
  globalFallbacksUsed = 0;
}

module.exports = {
  callGroq,
  callLLM,
  extractJson,
  safeParse,
  robustSafeParse,
  estimateTokens,
  getLLMCallCount,
  getFallbacksUsed,
  resetMetrics
};
