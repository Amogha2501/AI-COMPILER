function expandDomain(domain = "generic") {

  const expansions = {

    generic: {

      ui: {
        pages: [
          {
            name: "GenericDashboard",
            route: "/",
            components: [
              "Navbar",
              "Sidebar",
              "OverviewPanel",
              "SettingsPanel"
            ],
            apiDependencies: [
              "/api/users",
              "/api/sessions"
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
                required: true
              }
            ]
          },
          {
            path: "/api/sessions",
            method: "POST",
            validation: [
              {
                field: "token",
                type: "string",
                required: true
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
                type: "string",
                primaryKey: true,
                maxLength: 255
              },
              {
                name: "email",
                type: "string",
                maxLength: 255
              }
            ]
          },
          {
            name: "Sessions",
            fields: [
              {
                name: "token",
                type: "string",
                maxLength: 255
              }
            ]
          }
        ]
      },

      logic: {
        rules: [
          "user_authentication",
          "session_validation"
        ]
      }
    },

    ecommerce: {

      ui: {
        pages: [
          {
            name: "ProductDashboard",
            route: "/",
            components: [
              "ProductGrid",
              "CartPanel",
              "CheckoutPanel"
            ],
            apiDependencies: [
              "/api/products",
              "/api/orders"
            ]
          }
        ]
      }
    },

    messaging: {

      ui: {
        pages: [
          {
            name: "ChatDashboard",
            route: "/",
            components: [
              "ChatWindow",
              "ConversationList",
              "NotificationPanel"
            ],
            apiDependencies: [
              "/api/messages"
            ]
          }
        ]
      }
    }
  };

  return (
    expansions[domain] ||
    expansions.generic
  );
}

module.exports = {
  expandDomain
};