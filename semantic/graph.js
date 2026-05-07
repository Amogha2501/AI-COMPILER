/**
 * Semantic Architecture Graph
 * Maps dependencies between architectural components.
 */
class ArchGraph {
  constructor() {
    this.nodes = new Map();
  }

  addDependency(from, to) {
    if (!this.nodes.has(from)) this.nodes.set(from, []);
    this.nodes.get(from).push(to);
  }

  getDependencies(node) {
    return this.nodes.get(node) || [];
  }
}

const graph = new ArchGraph();
graph.addDependency('Auth', 'Database');
graph.addDependency('API', 'Auth');
graph.addDependency('UI', 'API');

module.exports = graph;
