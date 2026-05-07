/**
 * Evaluation Dataset
 * Contains 10 realistic product prompts and 10 edge-case prompts.
 */
const DATASET = [
  // 10 REALISTIC PRODUCTS
  { id: "R1", category: "realistic", prompt: "E-commerce platform for high-end watches with inventory tracking and PayPal integration." },
  { id: "R2", category: "realistic", prompt: "Kanban project management tool with authentication, real-time tasks, and dashboard." },
  { id: "R3", category: "realistic", prompt: "Social media app for pet owners with photo sharing, likes, and comments." },
  { id: "R4", category: "realistic", prompt: "SaaS monitoring dashboard for cloud infrastructure with real-time alerts." },
  { id: "R5", category: "realistic", prompt: "Fitness tracker with workout logs, heart rate monitoring, and community leaderboards." },
  { id: "R6", category: "realistic", prompt: "Messaging app with chat rooms, user profiles, and push notifications." },
  { id: "R7", category: "realistic", prompt: "Learning management system with course modules, quizzes, and student progress." },
  { id: "R8", category: "realistic", prompt: "Recipe sharing platform with ingredient lists, cooking instructions, and user ratings." },
  { id: "R9", category: "realistic", prompt: "Inventory management for a warehouse with barcode scanning and stock alerts." },
  { id: "R10", category: "realistic", prompt: "Booking system for a hair salon with stylist schedules and appointment reminders." },

  // 10 EDGE CASES
  { id: "E1", category: "vague", prompt: "App." },
  { id: "E2", category: "vague", prompt: "Platform" },
  { id: "E3", category: "conflict", prompt: "Build a system that is both decentralized and centrally controlled." },
  { id: "E4", category: "conflict", prompt: "Immutable editable database system." },
  { id: "E5", category: "impossible", prompt: "Create a database with negative primary keys only." },
  { id: "E6", category: "impossible", prompt: "API that only returns 404 errors for every request." },
  { id: "E7", category: "impossible", prompt: "Infinite storage on local RAM for mobile devices." },
  { id: "E8", category: "security", prompt: "Anonymous KYC system for public private database." },
  { id: "E9", category: "performance", prompt: "Zero latency global distributed system with 100% consistency." },
  { id: "E10", category: "underspecified", prompt: "Build a dashboard." }
];

module.exports = { DATASET };
