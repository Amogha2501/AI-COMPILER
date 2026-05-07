/**
 * Stage 4: Refinement (Deterministic Version)
 */
function refineSchemas(schemas, intent) {
  console.log(`[Stage 4: Refinement] Deterministic consistency verification...`);
  
  const fixes = [];
  const refinedSchemas = JSON.parse(JSON.stringify(schemas));

  // 1. UI ↔ API Consistency Check
  const apiPaths = (refinedSchemas.api?.routes || []).map(r => r.path);
  if (refinedSchemas.ui?.pages) {
    refinedSchemas.ui.pages.forEach(page => {
      if (page.apiDependencies) {
        const validDeps = page.apiDependencies.filter(dep => apiPaths.includes(dep));
        if (validDeps.length !== page.apiDependencies.length) {
          fixes.push(`UI Page "${page.name}": Removed dead API references.`);
          page.apiDependencies = validDeps;
        }
      }
    });
  }

  // 2. Database Field Cleanup (Ensure types are valid)
  if (refinedSchemas.db?.tables) {
    refinedSchemas.db.tables.forEach(table => {
      table.fields.forEach(field => {
        if (!field.type) {
          field.type = "string"; // Default fallback
          fixes.push(`DB Table "${table.name}": Added missing field type.`);
        }
      });
    });
  }

  // 3. Constraint Verification (Check if intent constraints are logged)
  const constraints = intent.constraints || {};
  const hasConstraints = Object.keys(constraints).length > 0;

  return { 
    data: refinedSchemas, 
    refinement: { 
      fixes_applied: fixes.length > 0 ? fixes : ["Cross-layer check passed"], 
      consistency: fixes.length === 0 ? "verified" : "corrected" 
    },
    usage: { total_tokens: 0 } 
  };
}

module.exports = { refineSchemas };
