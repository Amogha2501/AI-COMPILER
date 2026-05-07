function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function extractAllNames(schemas = {}) {

  const names = [];

  // UI
  safeArray(schemas.ui?.pages)
    .forEach(page => {

      if (page.name)
        names.push(page.name);

      safeArray(page.components)
        .forEach(c => names.push(c));
    });

  // API
  safeArray(schemas.api?.routes)
    .forEach(route => {

      if (route.path)
        names.push(route.path);
    });

  // DB
  safeArray(schemas.db?.tables)
    .forEach(table => {

      if (table.name)
        names.push(table.name);

      safeArray(table.fields)
        .forEach(field => {

          if (field.name)
            names.push(field.name);
        });
    });

  // LOGIC
  safeArray(schemas.logic?.rules)
    .forEach(rule => {

      if (typeof rule === "string")
        names.push(rule);
    });

  return names
    .map(v => String(v).toLowerCase());
}

/**
 * VALIDATE DOMAIN PURITY
 */
function validateDomainPurity(
  requestContext,
  schemas,
  domainClassification
) {

  const names =
    extractAllNames(schemas);

  const forbidden =
    safeArray(
      domainClassification.forbiddenDomains
    );

  const violations = [];

  forbidden.forEach(domain => {

    if (
      names.some(name =>
        name.includes(domain.toLowerCase())
      )
    ) {

      violations.push(
        `Forbidden domain detected: ${domain}`
      );
    }
  });

  return {
    passed: violations.length === 0,
    isPure: violations.length === 0,
    violations
  };
}

/**
 * FULL CONTAMINATION CHECK
 */
function validateAllContamination(
  requestContext,
  schemas,
  domainClassification
) {

  const purity =
    validateDomainPurity(
      requestContext,
      schemas,
      domainClassification
    );

  const names =
    extractAllNames(schemas);

  const unrelatedTerms = [
    "checkout",
    "shoppingcart",
    "followers",
    "socialfeed",
    "media",
    "likes"
  ];

  const contamination = [];

  unrelatedTerms.forEach(term => {

    if (
      names.some(name =>
        name.includes(term)
      )
    ) {

      contamination.push(
        `Potential contamination: ${term}`
      );
    }
  });

  return {

    passed:
      purity.passed &&
      contamination.length === 0,

    isContaminated:
      contamination.length > 0,

    violations: [
      ...purity.violations,
      ...contamination
    ]
  };
}

module.exports = {
  validateDomainPurity,
  validateAllContamination
};