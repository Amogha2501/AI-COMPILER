function containsAny(text = "", keywords = []) {
  const lower = text.toLowerCase();

  return keywords.some(k =>
    lower.includes(k.toLowerCase())
  );
}

function classify(prompt = "") {

  const text = prompt.toLowerCase();

  /**
   * DOMAIN DEFINITIONS
   */
  const domains = [

    {
      name: "ecommerce",

      keywords: [
        "shop",
        "cart",
        "checkout",
        "product",
        "order",
        "payment",
        "store",
        "ecommerce"
      ],

      allowedEntities: [
        "Product",
        "Cart",
        "Checkout",
        "Order",
        "Payment",
        "Customer"
      ],

      forbiddenDomains: [
        "warehouse",
        "messaging"
      ]
    },

    {
      name: "warehouse",

      keywords: [
        "inventory",
        "warehouse",
        "stock",
        "shipment",
        "barcode",
        "supply"
      ],

      allowedEntities: [
        "Inventory",
        "Stock",
        "Warehouse",
        "Shipment",
        "Barcode"
      ],

      forbiddenDomains: [
        "ecommerce",
        "social"
      ]
    },

    {
      name: "messaging",

      keywords: [
        "chat",
        "message",
        "conversation",
        "notification",
        "messaging"
      ],

      allowedEntities: [
        "Message",
        "ChatRoom",
        "Conversation",
        "Notification"
      ],

      forbiddenDomains: [
        "social",
        "warehouse"
      ]
    },

    {
      name: "social",

      keywords: [
        "feed",
        "post",
        "followers",
        "social",
        "media",
        "likes"
      ],

      allowedEntities: [
        "Post",
        "Feed",
        "Follower",
        "Media",
        "Like"
      ],

      forbiddenDomains: [
        "warehouse"
      ]
    },

    {
      name: "project_management",

      keywords: [
        "kanban",
        "task",
        "project",
        "sprint",
        "board",
        "team"
      ],

      allowedEntities: [
        "Task",
        "Project",
        "Board",
        "Sprint",
        "Team"
      ],

      forbiddenDomains: [
        "ecommerce"
      ]
    }
  ];

  /**
   * FIND PRIMARY DOMAIN
   */
  for (const domain of domains) {

    if (
      containsAny(
        text,
        domain.keywords
      )
    ) {

      return {
        primaryDomain: domain.name,
        secondaryDomains: [],
        forbiddenDomains:
          domain.forbiddenDomains,

        allowedEntities:
          domain.allowedEntities
      };
    }
  }

  /**
   * DEFAULT FALLBACK
   */
  return {

    primaryDomain: "generic",

    secondaryDomains: [],

    forbiddenDomains: [],

    allowedEntities: [
      "User",
      "Dashboard",
      "Settings"
    ]
  };
}

module.exports = {
  classify
};