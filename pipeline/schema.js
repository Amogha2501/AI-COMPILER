const { callLLM, safeParse, estimateTokens } = require('./utils');
require('dotenv').config();

/**
 * Stage 3: Schema Generation (Strict Constraint Upgrade)
 */
async function generateSchemas(design, constraints, prompt = "") {
  console.log(`[Stage 3: Schema Generation] Generating multi-layer schemas with strict constraints...`);
  
  const llmPrompt = `Generate STRICT JSON schemas for UI, API, DB, Auth, and Logic layers.
Design: ${JSON.stringify(design)}
Constraints: ${JSON.stringify(constraints)}

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
1. API validation MUST use objects: { "field": string, "type": string, "constraint": string }.
2. DB fields MUST include technical limits (e.g., maxLength: 0 for password if constrained).
3. Logic layer MUST include specific rules for every constraint (e.g., "password_length_must_be_0").
4. UI MUST include components for every constrained field.

Return ONLY valid JSON with keys: ui, api, db, auth, logic.
No explanation.
JSON:`;

  try {
    const generatedText = await callLLM(llmPrompt);
    let schemas = {};

try {
  schemas = safeParse(generatedText);
} catch (parseError) {
  console.log("JSON PARSE FAILED:", parseError.message);
  schemas = {};
}
    
    // Fallback if parsing failed or incomplete
    if (!schemas || !schemas.ui || !schemas.api || !schemas.db || !schemas.auth || !schemas.logic) {
      console.warn("[Stage 3] Incomplete schemas. Using semantic fallback recovery.");
      const { extractSemanticKeywords } = require('./semantics');
      const keywords = extractSemanticKeywords(prompt);
      
      schemas = schemas || {};
      
      // Module-specific semantic recovery (Detailed)
      if (!schemas.ui || !schemas.ui.pages || !schemas.ui.pages.length) {
        schemas.ui = { 
          pages: keywords.modules.map((m, i) => ({ 
            name: m, 
            route: i === 0 ? "/" : `/${m.toLowerCase()}`,
            components: [{ name: `${m}Header`, type: "Navigation" }, { name: `${m}Main`, type: "Content" }],
            apiDependencies: [keywords.apis[i % keywords.apis.length]]
          })), 
          components: [] 
        };
      }
      if (!schemas.api || !schemas.api.routes || !schemas.api.routes.length) {
        schemas.api = { 
          routes: keywords.apis.map(path => ({ 
            path, 
            method: "GET",
            validation: [{ field: "id", type: "string", constraint: "required" }]
          })) 
        };
      }
      if (!schemas.db || !schemas.db.tables || !schemas.db.tables.length) {
        schemas.db = { 
          tables: keywords.entities.map(name => ({ 
            name, 
            fields: [
              { name: "id", type: "uuid" },
              { name: "name", type: "string", maxLength: 255 },
              { name: "status", type: "string" },
              { name: "createdAt", type: "timestamp" }
            ] 
          })) 
        };
      }
     if (!schemas.auth) {
  schemas.auth = {
    roles: ["Admin", "User"],
    strategy: "JWT"
  };
}

if (!schemas.logic) {
  schemas.logic = {
    rules: [
      "user_must_be_authenticated"
    ]
  };
}
      // Track recovery in schemas (for metrics)
      schemas.__semanticRecovery = true;
    }
    
    console.log(`[Stage 3] Completed.`);
    return { 
      data: schemas, 
      usage: { total_tokens: estimateTokens(llmPrompt + generatedText) } 
    };
  } catch (err) {

  console.log(`[Stage 3] LLM Error: ${err.message}`);

  return {
    data: {
      ui: {
        pages: [
          {
            name: "Dashboard",
            route: "/",
            components: [
              "Navbar",
              "Sidebar",
              "OverviewPanel"
            ],
            apiDependencies: [
              "/api/users"
            ]
          }
        ]
      },

      api: {
        routes: [
          {
            path: "/api/users",
            method: "GET",
            validation: [
              {
                field: "id",
                type: "string",
                constraint: "required"
              }
            ]
          }
        ]
      },

      db: {
        tables: [
          {
            name: "Users",
            fields: [
              {
                name: "id",
                type: "uuid"
              },
              {
                name: "email",
                type: "string",
                maxLength: 255
              }
            ]
          }
        ]
      },

      auth: {
        roles: ["Admin", "User"]
      },

      logic: {
        rules: [
          "user_must_be_authenticated"
        ]
      }
    },

    usage: {
      total_tokens: 0
    }
  };
}
}

module.exports = { generateSchemas };
