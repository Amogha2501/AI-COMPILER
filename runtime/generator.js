/**
 * Stage 8: Executable Runtime Generator (Hardened Edition)
 * Synthesizes a real starter application structure with safety guards.
 */

/**
 * Normalization Layer: Guarantees essential structures exist
 */
function normalizeRuntimeSchemas(schemas) {
  const s = JSON.parse(JSON.stringify(schemas || {}));
  if (!s.ui) s.ui = {};
  if (!s.ui.pages) s.ui.pages = [];
  if (!s.ui.components) s.ui.components = [];
  
  if (!s.api) s.api = {};
  if (!s.api.routes) s.api.routes = [];
  
  if (!s.db) s.db = {};
  if (!s.db.tables) s.db.tables = [];
  
  if (!s.logic) s.logic = {};
  if (!s.logic.rules) s.logic.rules = [];
  
  return s;
}

/**
 * Safe Template Helpers
 */
function safeJoin(arr, separator = "\n") {
  return Array.isArray(arr) ? arr.join(separator) : "";
}

function safeMap(arr, fn) {
  return Array.isArray(arr) ? arr.map(fn) : [];
}

/**
 * Content Fallback Generator
 */
function generateSafeFallbackContent(type, name = "Placeholder") {
  switch (type) {
    case 'frontend':
      return `
import React from 'react';
export default function ${name}() {
  return (
    <div className="fallback-component">
      <h2>${name} (Generated Fallback)</h2>
      <p>Module partially generated due to architectural ambiguity.</p>
    </div>
  );
}`.trim();
    case 'backend':
      return `
const express = require('express');
const router = express.Router();
router.all('*', (req, res) => {
  res.json({ success: true, message: "Fallback API for ${name}" });
});
module.exports = router;`.trim();
    case 'sql':
      return `CREATE TABLE ${name} (id VARCHAR(255) PRIMARY KEY);`;
    default:
      return "// Placeholder content";
  }
}

/**
 * Main Runtime Synthesis
 */
function simulateExecution(rawSchemas) {
  console.log("[Stage 8: Runtime Generation] Initializing hardened synthesis...");
  
  const schemas = normalizeRuntimeSchemas(rawSchemas);
  const project = {
    structure: [],
    files: {},
    dependencies: {
      frontend: ["react", "react-router-dom", "lucide-react", "axios"],
      backend: ["express", "cors", "jsonwebtoken", "bcryptjs", "dotenv"]
    }
  };

  const report = {
    generatedFiles: 0,
    successfulFiles: 0,
    fallbackFiles: 0,
    failedFiles: 0
  };

  function writeFile(path, content, type, name) {
    try {
      project.structure.push(path);
      let finalContent = content;
      
      if (!finalContent || typeof finalContent !== 'string' || finalContent.trim().length === 0) {
        finalContent = generateSafeFallbackContent(type, name);
        report.fallbackFiles++;
      } else {
        report.successfulFiles++;
      }
      
      project.files[path.split('/').pop()] = finalContent;
      report.generatedFiles++;
    } catch (err) {
      console.error(`[Runtime Gen] Failed to generate ${path}:`, err.message);
      report.failedFiles++;
    }
  }

  // 1. FRONTEND GENERATION
  const pages = schemas.ui.pages;
  pages.forEach(page => {
    const fileName = `${page.name || 'GeneratedPage'}.jsx`;
    const path = `frontend/src/pages/${fileName}`;
    
    let content = "";
    try {
      const components = safeMap(page.components, c => c.name);
      content = `
import React from 'react';
// Imports: ${safeJoin(components, ', ')}

export default function ${page.name || 'GeneratedPage'}() {
  return (
    <div className="page-container">
      <h1>${page.name || 'Generated Page'}</h1>
      <div className="components">
        ${safeJoin(safeMap(page.components, c => `<${c.name} />`), '\n        ')}
      </div>
    </div>
  );
}
      `.trim();
    } catch (err) {
      console.warn(`[Runtime Gen] Page ${page.name} failed template rendering. Using fallback.`);
    }
    
    writeFile(path, content, 'frontend', page.name);
  });

  // 2. BACKEND GENERATION
  const routes = schemas.api.routes;
  routes.forEach(route => {
    const name = route.path ? route.path.split('/').pop() : 'default';
    const fileName = `${name}.js`;
    const path = `backend/src/routes/${fileName}`;
    
    let content = "";
    try {
      content = `
const express = require('express');
const router = express.Router();

// Validation: ${JSON.stringify(route.validation || [])}
router.${(route.method || 'GET').toLowerCase()}('${route.path || '/'}', (req, res) => {
  res.json({ 
    success: true, 
    path: "${route.path || '/'}",
    requestId: "${schemas.__requestId || 'unknown'}"
  });
});

module.exports = router;
      `.trim();
    } catch (err) {
      console.warn(`[Runtime Gen] Route ${route.path} failed template rendering.`);
    }
    
    writeFile(path, content, 'backend', name);
  });

  // 3. DATABASE SCHEMAS
  const tables = schemas.db.tables;
  tables.forEach(table => {
    const fileName = `${table.name || 'table'}.sql`;
    const path = `backend/src/db/${fileName}`;
    
    let content = "";
    try {
      content = `
CREATE TABLE ${table.name || 'placeholder_table'} (
  ${safeJoin(safeMap(table.fields, f => `${f.name} ${ (f.type || 'VARCHAR').toUpperCase() }${f.maxLength ? `(${f.maxLength})` : ''}`), ',\n  ')}
);
      `.trim();
    } catch (err) {
      console.warn(`[Runtime Gen] Table ${table.name} failed template rendering.`);
    }
    
    writeFile(path, content, 'sql', table.name);
  });

  // 4. PACKAGE CONFIG
  writeFile("package.json", JSON.stringify({
    name: "generated-architecture",
    version: "1.0.0",
    dependencies: project.dependencies,
    report: report
  }, null, 2), 'json', 'package');

  console.log(`[Stage 8] Synthesis finished. ${report.successfulFiles} success, ${report.fallbackFiles} fallbacks.`);
  
  return {
    status: "generated",
    project,
    report,
    timestamp: new Date().toISOString()
  };
}

module.exports = { simulateExecution };
