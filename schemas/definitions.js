const { z } = require('zod');

const IntentSchema = z.object({
  features: z.array(z.string()),
  entities: z.array(z.string()),
  roles: z.array(z.string()),
  constraints: z.array(z.string())
});

const DesignSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      properties: z.array(z.string())
    })
  ),
  relationships: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      type: z.enum(["one-to-one", "one-to-many", "many-to-many"])
    })
  ),
  userRoles: z.array(z.string()),
  applicationFlows: z.array(
    z.object({
      name: z.string(),
      steps: z.array(z.string())
    })
  )
});

const UiSchema = z.object({

  pages: z.array(

    z.object({

      name: z.string(),

      route: z.string(),

      components: z.array(

        z.union([

          z.string(),

          z.object({
            name: z.string().optional(),
            type: z.string().optional()
          })

        ])

      ),

      apiDependencies:
        z.array(z.string()).optional()
    })

  ),

  layout: z.string().optional()
});

const ApiSchema = z.object({
  routes: z.array(
    z.object({
      path: z.string(),

      method: z.enum([
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH"
      ]),

      validation: z.array(

        z.object({
          field: z.string(),

          type: z.string().optional(),

          constraint: z.string().optional()
        })

      ).optional()
    })
  )
});
const DbSchema = z.object({
  tables: z.array(
    z.object({
      name: z.string(),
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          primaryKey: z.boolean().optional(),
          foreignKey: z.string().optional()
        })
      )
    })
  )
});

const AuthSchema = z.object({
  roles: z.array(z.string()).optional(),

  permissions: z.record(
    z.string(),
    z.array(z.string())
  ).optional(),

  strategy: z.string().optional()
});

const LogicSchema = z.object({
  rules: z.array(z.string()).optional()
});

const SchemasContainer = z.object({
  ui: UiSchema,
  api: ApiSchema,
  db: DbSchema,
  auth: AuthSchema,
  logic: LogicSchema
});

module.exports = {
  IntentSchema,
  DesignSchema,
  UiSchema,
  ApiSchema,
  DbSchema,
  AuthSchema,
  LogicSchema,
  SchemasContainer
};
