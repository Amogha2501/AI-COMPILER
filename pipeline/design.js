const { callLLM, safeParse, estimateTokens } = require('./utils');
require('dotenv').config();

/**
 * Stage 2: System Design (Upgraded for Constraint Propagation)
 */
async function createDesign(intent) {
  console.log(`[Stage 2: System Design] Generating architecture with strict constraints...`);
  
  const llmPrompt = `Convert software intent and constraints into a system architecture blueprint.
Intent: ${JSON.stringify(intent)}

CRITICAL RULES:
1. ONLY generate components directly related to the features and constraints.
2. DO NOT include dashboards, widgets, or unrelated entities unless explicitly requested.
3. Propagate all constraints into the entities and application flows.

Return ONLY valid JSON with keys: 
- entities (array of {name, description, properties})
- relationships (array of {source, target, type})
- userRoles (string array)
- applicationFlows (array of {name, steps})

No explanation. No extra text.
JSON:`;

  try {
    const generatedText = await callLLM(llmPrompt);
    const design = safeParse(generatedText);
    
    console.log(`[Stage 2] Completed.`);
    return { 
      data: design, 
      usage: { total_tokens: estimateTokens(llmPrompt + generatedText) } 
    };
  } catch (err) {

  console.log(`[Stage 2] LLM Error: ${err.message}`);

  return {
    data: {
      entities: [
        {
          name: "User",
          description: "Application user",
          properties: {
            id: "uuid",
            email: "string"
          }
        }
      ],

      relationships: [],

      userRoles: ["Admin", "User"],

      applicationFlows: [
        {
          name: "Authentication",
          steps: [
            "Login",
            "Access Dashboard"
          ]
        }
      ]
    },

    usage: {
      total_tokens: 0
    }
  };
}
}

module.exports = { createDesign };
