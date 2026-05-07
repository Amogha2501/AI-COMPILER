const { callLLM, safeParse, estimateTokens } = require('./utils');
require('dotenv').config();

/**
 * Stage 1: Intent Extraction (Reliability Upgrade)
 */
async function extractIntent(prompt) {
  console.log(`[Stage 1: Intent Extraction] Parsing input for ambiguities and assumptions...`);
  
  const llmPrompt = `Extract structured software intent and STRICT constraints from this request:
"${prompt}"

Return ONLY valid JSON with keys: 
- system (string: name of the system)
- features (string array)
- entities (string array)
- roles (string array)
- constraints (object: technical rules)
- ambiguities (string array: things that are unclear)

No explanation. No extra text.
JSON:`;

  try {
    const generatedText = await callLLM(llmPrompt);
    const intent = safeParse(generatedText);
    
    console.log(`[Stage 1] Completed.`);
    return { 
      data: intent, 
      usage: { total_tokens: estimateTokens(llmPrompt + generatedText) } 
    };
  } catch (err) {

  console.log(`[Stage 1] LLM Error: ${err.message}`);

  return {
    data: {
      system: "Generic Web Application",
      features: ["Authentication", "Dashboard"],
      entities: ["User"],
      roles: ["Admin", "User"],
      constraints: {},
      ambiguities: ["Prompt too vague"]
    },
    usage: {
      total_tokens: 0
    }
  };
}
}

module.exports = { extractIntent };
