/**
 * Semantic Keyword Extractor
 * Infers domain-specific entities, modules, and APIs from the user prompt.
 */
function extractSemanticKeywords(prompt) {
  const text = (prompt || "").toLowerCase();
  
  const keywords = {
    entities: [],
    modules: [],
    apis: []
  };

  // Domain detection logic
  const domains = {
    ecommerce: {
      triggers: ['store', 'shop', 'ecommerce', 'cart', 'checkout', 'inventory', 'product', 'watch', 'order'],
      entities: ['Product', 'Order', 'User', 'Category', 'Review'],
      modules: ['ProductCatalog', 'ShoppingCart', 'CheckoutFlow', 'OrderHistory'],
      apis: ['/api/products', '/api/orders', '/api/cart', '/api/users']
    },
    pm: {
      triggers: ['project', 'task', 'kanban', 'management', 'team', 'collaboration', 'board', 'sprint'],
      entities: ['Task', 'Project', 'User', 'Team', 'Comment', 'Board'],
      modules: ['TaskBoard', 'ProjectDashboard', 'TeamRoster', 'ActivityFeed'],
      apis: ['/api/tasks', '/api/projects', '/api/teams', '/api/comments']
    },
    social: {
      triggers: ['social', 'feed', 'post', 'comment', 'friend', 'photo', 'share', 'pet', 'profile'],
      entities: ['Post', 'Comment', 'User', 'Media', 'Friendship'],
      modules: ['SocialFeed', 'UserProfile', 'Notifications', 'Discovery'],
      apis: ['/api/posts', '/api/comments', '/api/users', '/api/media']
    },
    saas: {
      triggers: ['saas', 'dashboard', 'monitor', 'metrics', 'alert', 'infrastructure', 'cloud', 'billing'],
      entities: ['Metric', 'Alert', 'User', 'Subscription', 'Service'],
      modules: ['MainDashboard', 'AlertCenter', 'Settings', 'UsageStats'],
      apis: ['/api/metrics', '/api/alerts', '/api/billing', '/api/users']
    },
    messaging: {
      triggers: ['chat', 'message', 'messaging', 'messenger', 'conversation', 'inbox', 'notification'],
      entities: ['Message', 'Conversation', 'User', 'Notification', 'Attachment'],
      modules: ['ChatWindow', 'InboxView', 'ContactsList', 'NotificationPanel'],
      apis: ['/api/messages', '/api/conversations', '/api/users', '/api/notifications']
    }
  };

  // Find matching domain
  let matchedDomain = null;
  for (const [name, domain] of Object.entries(domains)) {
    if (domain.triggers.some(t => text.includes(t))) {
      matchedDomain = domain;
      break;
    }
  }

  if (matchedDomain) {
    keywords.entities = matchedDomain.entities;
    keywords.modules = matchedDomain.modules;
    keywords.apis = matchedDomain.apis;
  } else {
    // Generic fallback if no domain matches
    keywords.entities = ['Item', 'User', 'Log'];
    keywords.modules = ['MainDashboard', 'Settings', 'DetailsView'];
    keywords.apis = ['/api/items', '/api/users', '/api/system'];
  }

  return keywords;
}

module.exports = { extractSemanticKeywords };
