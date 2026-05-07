const { callLLM, robustSafeParse, estimateTokens } = require('./utils');
require('dotenv').config();

/**
 * Stage 1 & 2: Merged Intent Extraction & System Design
 */
async function extractIntentAndDesign(prompt) {
  console.log(`[Stage 1 & 2: Intent + Design] Parsing input and generating architecture...`);
  
  const llmPrompt = `Extract software intent and convert it into a system architecture blueprint for this request:
"${prompt}"

Return ONLY valid JSON with keys:
- intent: {
    system: string,
    features: string array,
    entities: string array,
    roles: string array,
    constraints: object (technical rules),
    ambiguities: string array
  }
- design: {
    entities: array of {name, description, properties},
    relationships: array of {source, target, type},
    userRoles: string array,
    applicationFlows: array of {name, steps}
  }

STRICT JSON RULES:
RETURN ONLY VALID JSON.
DO NOT USE MARKDOWN.
DO NOT WRAP IN \`\`\`json.
DO NOT ADD EXPLANATIONS.
DO NOT ADD COMMENTS.
OUTPUT MUST START WITH { AND END WITH }.
ALL ARRAYS AND OBJECTS MUST BE COMPLETE.
NO TRAILING COMMAS.

STRICT DESIGN RULES:
1. ONLY generate components directly related to the features and constraints.
2. Propagate all constraints into the entities and flows.

No explanation. No extra text.
JSON:`;

  try {
    const generatedText = await callLLM(llmPrompt);
    let result = robustSafeParse(generatedText);
    
    // Fallback if parsing failed or incomplete
    if (!result || !result.intent || !result.design) {
      console.warn("[Stage 1 & 2] Incomplete result. Using semantic fallback recovery.");
      const { extractSemanticKeywords } = require('./semantics');
      const keywords = extractSemanticKeywords(prompt);
      
      const { mockIntent, mockDesign } = require('./mock');
      result = result || {};
      
      if (!result.intent) {
        result.intent = {
          ...mockIntent,
          system: prompt.substring(0, 50),
          entities: keywords.entities
        };
      }
      
      if (!result.design) {
        result.design = {
          ...mockDesign,
          entities: keywords.entities.map(e => ({ name: e, description: `Core ${e} entity`, properties: [] })),
          applicationFlows: keywords.modules.map(m => ({ name: m, steps: [`Initialize ${m}`] }))
        };
      }
    }

    console.log(`[Stage 1 & 2] Completed.`);
    return { 
      data: result, 
      usage: { total_tokens: estimateTokens(llmPrompt + generatedText) } 
    };
  } catch (err) {
    console.log(`[Stage 1 & 2] LLM Error: ${err.message}. Falling back to mock.`);
    const { mockIntent, mockDesign } = require('./mock');
    return { 
      data: { intent: mockIntent, design: mockDesign }, 
      usage: { total_tokens: 0 } 
    };
  }
}

module.exports = { extractIntentAndDesign };
