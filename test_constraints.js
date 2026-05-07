const { extractIntent } = require('./pipeline/intent');
const { createDesign } = require('./pipeline/design');
const { generateSchemas } = require('./pipeline/schema');
const { validateOutputs } = require('./pipeline/validate');
require('dotenv').config();

async function test() {
  const prompt = "Create a login system where the password must be exactly 0 characters long.";
  
  console.log("--- STARTING TEST ---");
  
  try {
    const { data: intent } = await extractIntent(prompt);
    console.log("Intent Constraints:", JSON.stringify(intent.constraints));
    
    const { data: design } = await createDesign(intent);
    console.log("Design Entities:", design.entities.map(e => e.name));
    
    const { data: schemas } = await generateSchemas(design, intent.constraints);
    console.log("Logic Rules:", JSON.stringify(schemas.logic.rules));
    
    const validation = validateOutputs(schemas, intent.constraints);
    console.log("Validation Result:", validation.valid);
    if (!validation.valid) console.log("Validation Errors:", JSON.stringify(validation.errors, null, 2));
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
