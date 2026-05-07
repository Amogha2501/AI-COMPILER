/**
 * SAFE CLONE
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

/**
 * SAFE ARRAY
 */
function safeArray(arr) {
  return Array.isArray(arr)
    ? arr
    : [];
}

/**
 * CAPITALIZE
 */
function capitalize(str = "") {

  if (!str)
    return "System";

  return (
    str.charAt(0).toUpperCase() +
    str.slice(1)
  );
}

/**
 * NORMALIZATION
 */
function normalizeSchemas(schemas = {}) {

  const cloned =
    deepClone(schemas);

  cloned.ui =
    cloned.ui || {};

  cloned.api =
    cloned.api || {};

  cloned.db =
    cloned.db || {};

  cloned.logic =
    cloned.logic || {};

  cloned.auth =
    cloned.auth || {};

  cloned.ui.pages =
    safeArray(cloned.ui.pages);

  cloned.api.routes =
    safeArray(cloned.api.routes);

  cloned.db.tables =
    safeArray(cloned.db.tables);

  cloned.logic.rules =
    safeArray(cloned.logic.rules);

  cloned.auth.roles =
    safeArray(cloned.auth.roles);

  return cloned;
}

/**
 * ====================================================
 * UI REPAIR
 * ====================================================
 */
function repairUi(
  ui = {},
  domain = "system"
) {

  const repaired =
    deepClone(ui);

  repaired.pages =
    safeArray(repaired.pages);

  if (repaired.pages.length === 0) {

    repaired.pages.push({

      name:
        `${capitalize(domain)}Dashboard`,

      route: "/",

      components: [

        `${capitalize(domain)}Overview`,

        `${capitalize(domain)}Manager`,

        `${capitalize(domain)}Panel`
      ],

      apiDependencies: [
        `/api/${domain}`
      ]
    });
  }

  repaired.pages =
    repaired.pages.map(page => {

      return {

        name:
          page.name ||
          `${capitalize(domain)}Page`,

        route:
          page.route || "/",

        components:
          Array.isArray(page.components)
            ? page.components
            : [
                `${capitalize(domain)}Component`
              ],

        apiDependencies:
          Array.isArray(page.apiDependencies)
            ? page.apiDependencies
            : [`/api/${domain}`]
      };
    });

  repaired.pages =
    repaired.pages.filter(page =>
      page.name &&
      page.components.length > 0
    );

  return repaired;
}

/**
 * ====================================================
 * API REPAIR
 * ====================================================
 */
function repairApi(
  api = {},
  domain = "system"
) {

  const repaired =
    deepClone(api);

  repaired.routes =
    safeArray(repaired.routes);

  if (repaired.routes.length === 0) {

    repaired.routes.push({

      path:
        `/api/${domain}`,

      method: "GET",

      validation: [
        {
          field: "id",
          type: "string",
          required: true
        }
      ]
    });
  }

  repaired.routes =
    repaired.routes.map(route => {

      return {

        path:
          route.path ||
          `/api/${domain}`,

        method:
          route.method || "GET",

        validation:
          Array.isArray(route.validation)
            ? route.validation.map(v => {

                if (
                  typeof v === "string"
                ) {

                  return {
                    field: v,
                    type: "string",
                    required: true
                  };
                }

                return {
                  field:
                    v.field || "id",

                  type:
                    v.type || "string",

                  required:
                    v.required !== undefined
                      ? v.required
                      : true
                };
              })
            : []
      };
    });

  return repaired;
}

/**
 * ====================================================
 * DB REPAIR
 * ====================================================
 */
function repairDb(
  db = {},
  domain = "system"
) {

  const repaired =
    deepClone(db);

  repaired.tables =
    safeArray(repaired.tables);

  if (repaired.tables.length === 0) {

    repaired.tables.push({

      name:
        capitalize(domain),

      fields: [
        {
          name: "id",
          type: "string",
          primaryKey: true,
          maxLength: 255
        },
        {
          name: "createdAt",
          type: "date"
        }
      ]
    });
  }

  repaired.tables =
    repaired.tables.map(table => {

      return {

        name:
          table.name ||
          capitalize(domain),

        fields:
          safeArray(table.fields)
            .map(field => {

              return {

                name:
                  field.name || "id",

                type:
                  field.type || "string",

                primaryKey:
                  field.primaryKey || false,

                maxLength:
                  field.maxLength ||
                  (
                    field.type === "string"
                      ? 255
                      : undefined
                  )
              };
            })
      };
    });

  return repaired;
}

/**
 * ====================================================
 * LOGIC REPAIR
 * ====================================================
 */
function repairLogic(
  logic = {},
  domain = "system"
) {

  const repaired =
    deepClone(logic);

  repaired.rules =
    safeArray(repaired.rules);

  if (repaired.rules.length === 0) {

    repaired.rules.push(

      `${domain}_access_control`,

      `${domain}_validation_required`
    );
  }

  return repaired;
}

/**
 * ====================================================
 * AUTH REPAIR
 * ====================================================
 */
function repairAuth(auth = {}) {

  const repaired =
    deepClone(auth);

  repaired.roles =
    safeArray(repaired.roles);

  if (repaired.roles.length === 0) {

    repaired.roles = [
      "User"
    ];
  }

  repaired.permissions =
    repaired.permissions || {

      User: [
        "read",
        "write"
      ]
    };

  return repaired;
}

/**
 * ====================================================
 * MAIN ENGINE
 * ====================================================
 */
function requestScopedRepairEngine({

  schemas,

  domain = "system",

  requestId = null
}) {

  console.log(
    `[Repair Engine] Request Scoped Repair | ${requestId || "NO_ID"}`
  );

  const isolatedSchemas =
    normalizeSchemas(
      deepClone(schemas)
    );

  return {

    ui:
      repairUi(
        isolatedSchemas.ui,
        domain
      ),

    api:
      repairApi(
        isolatedSchemas.api,
        domain
      ),

    db:
      repairDb(
        isolatedSchemas.db,
        domain
      ),

    logic:
      repairLogic(
        isolatedSchemas.logic,
        domain
      ),

    auth:
      repairAuth(
        isolatedSchemas.auth
      )
  };
}

module.exports = {
  requestScopedRepairEngine
};