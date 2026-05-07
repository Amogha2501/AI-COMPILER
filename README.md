# AI Compiler

An intelligent schema compilation and validation system powered by AI. AI Compiler transforms natural language requirements into structured, validated schemas with semantic analysis and constraint verification.

## Overview

AI Compiler is an enterprise-grade system that bridges the gap between human requirements and machine-readable specifications. It leverages large language models to understand intent, generate schemas, validate constraints, and detect semantic issues automatically.

## AI Models

The system utilizes the following AI models through the Groq API inference engine:

- **llama-3.1-8b-instant**: Primary model for complex schema generation and semantic analysis
- **llama3-8b-8192**: Fallback model

### Key Features

- **Intent Extraction**: Parse natural language requests to extract system requirements, features, entities, roles, and constraints
- **Schema Generation**: Automatically generate JSON schemas based on extracted intent
- **Semantic Validation**: Validate schemas against architectural patterns and domain ontologies
- **Constraint Verification**: Check technical constraints and catch conflicts
- **Contamination Detection**: Identify data isolation and cross-cutting concerns
- **Automated Repair**: Fix schema issues and resolve constraint violations
- **Execution Simulation**: Test generated schemas through runtime simulation
- **Confidence Scoring**: Measure reliability and certainty of generated outputs
- **Evaluation Metrics**: Comprehensive testing and performance analysis
- Request-scoped repair isolation
- Runtime execution simulation
- Architectural assumption inference
- Semantic contradiction detection
- Confidence-based execution analysis
- Automatic vague prompt detection
## Project Structure

```
AI_Compiler/
├── pipeline/              # Core compilation pipeline
│   ├── intent.js         # Stage 1: Intent extraction
│   ├── intent_design.js  # Intent-driven design
│   ├── schema.js         # Stage 2: Schema generation
│   ├── refine.js         # Stage 3: Schema refinement
│   ├── validate.js       # Stage 4: Schema validation
│   ├── repair.js         # Stage 5: Schema repair
│   ├── execution.js      # Stage 6: Execution simulation
│   ├── design.js         # Design patterns
│   ├── semantic_validator.js  # Semantic validation
│   ├── semantics.js      # Semantic processing
│   ├── schema.js         # Schema utilities
│   └── utils.js          # Pipeline utilities
├── semantic/             # Semantic analysis engine
│   ├── engine.js         # Main semantic engine
│   ├── ontology.js       # Architectural ontologies
│   ├── graph.js          # Knowledge graph
│   ├── domainClassifier.js    # Domain classification
│   ├── domainExpander.js      # Domain expansion
│   ├── contradictionEngine.js # Contradiction detection
│   ├── contaminationDetector.js # Data contamination
│   ├── validationEngine.js    # Validation rules
│   ├── inputStabilizer.js     # Input normalization
│   ├── requestContext.js      # Request isolation
│   ├── requestScopedRepairEngine.js # Request-scoped repair
│   └── constraints.js    # Constraint definitions
├── evaluation/           # Testing & metrics
│   ├── dataset.js        # Test datasets
│   ├── dataset.json      # Dataset configuration
│   ├── metrics.js        # Performance metrics
│   ├── runner.js         # Test runner
│   └── reports/          # Generated reports
├── runtime/              # Execution simulation
│   └── generator.js      # Schema runtime generator
├── schemas/              # Schema definitions
│   └── definitions.js    # Schema templates
├── public/               # Web interface
│   └── index.html        # Frontend
├── output/               # Generated outputs
├── server.js             # Express server
├── package.json          # Dependencies
├── .env                  # Environment configuration
├── test.js              # Unit tests
├── test_constraints.js  # Constraint tests
└── debug_res.json       # Debug results
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amogha2501/AI-COMPILER.git
   cd AI_Compiler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Start the server**
   ```bash
   node server.js
   ```
   
   The server will run on `http://localhost:3000` by default.

 ## Live Demo

## Live Demo

https://your-render-url.onrender.com

## Usage

### Web Interface

Access the web interface at `http://localhost:3000` to:
- Submit natural language requirements
- View generated schemas
- Review semantic validation results
- See confidence scores and recommendations

### API Endpoints

#### POST /compile
Compile natural language requirements into schemas.

**Request:**
```json
{
  "prompt": "Create a user management system with authentication"
}
```

**Response:**
```json
{
  "intent": { /* extracted intent */ },
  "schemas": { /* generated schemas */ },
  "validation": { /* validation results */ },
  "confidence": 0.95,
  "metrics": { /* performance metrics */ }
}
```

### Programmatic Usage

```javascript
const { extractIntentAndDesign } = require('./pipeline/intent_design');
const { generateSchemas } = require('./pipeline/schema');
const { validateOutputs } = require('./pipeline/validate');

async function compileRequirement(userPrompt) {
  // Stage 1: Extract intent
  const intent = await extractIntentAndDesign(userPrompt);
  
  // Stage 2: Generate schemas
  const schemas = await generateSchemas(intent);
  
  // Stage 3: Validate
  const validation = await validateOutputs(schemas);
  
  return { intent, schemas, validation };
}
```

## Pipeline Stages

### Stage 1: Intent + Design
Parses the input prompt to extract:
- System name and description
- Features and capabilities
- Entities and data models
- User roles and permissions
- Technical constraints
- Ambiguities and clarifications needed

### Stage 2: Schema Generation
Generates JSON schemas based on:
- Extracted intent
- Domain ontologies
- Architectural patterns
- Best practices

### Stage 3: Refinement
Improves schemas through:
- Pattern completion
- Optimization
- Edge case handling

### Stage 4: Validation
Validates against:
- JSON schema standards
- Architectural constraints
- Domain rules
- Technical requirements

### Stage 5: Repair
Automatically fixes:
- Schema violations
- Constraint conflicts
- Semantic issues

### Stage 6: Execution Simulation
Tests schemas through:
- Runtime generation
- Input/output validation
- Performance simulation

## Semantic Analysis

### Domain Classification
Identifies the application domain (e.g., e-commerce, healthcare, finance) to apply domain-specific rules.

### Contamination Detection
Ensures data isolation and prevents:
- Cross-cutting concerns
- Unwanted data coupling
- Security violations

### Contradiction Engine
Detects and resolves:
- Conflicting requirements
- Incompatible architectural patterns
- Constraint violations

### Validation Engine
Enforces:
- Technical constraints
- Business rules
- Architectural guidelines

## Configuration

### Environment Variables

- `GROQ_API_KEY`: Groq API key for LLM calls
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

### Schema Definitions

Modify `schemas/definitions.js` to customize:
- Entity types
- Constraint templates
- Validation rules
- Architectural patterns

## Testing

### Run Unit Tests
```bash
node test.js
```

### Run Constraint Tests
```bash
node test_constraints.js
```

### Generate Evaluation Reports
```bash
node evaluation/runner.js
```
## Evaluation

The system includes a benchmark suite for:

- Semantic stress testing
- Contradiction detection
- Vague input handling
- Runtime synthesis validation
- Repair engine effectiveness
- Architectural confidence scoring

Run evaluation:

```bash
node evaluation/metrics.js
```
## Output

Generated outputs are saved to the `output/` directory:
- `schemas.json` - Generated schemas
- `validation_report.json` - Validation results
- `metrics.json` - Performance metrics
- `debug_output.json` - Debug information

## Performance Metrics

The system tracks:
- Schema generation time
- Validation accuracy
- Confidence scores
- Repair success rate
- API token usage
- Execution performance

Access metrics through:
```javascript
const { getMetrics } = require('./pipeline/utils');
const metrics = getMetrics();
```

## Troubleshooting

### Common Issues

**Issue: API Key errors**
- Verify API keys in `.env` are correct
- Check API quotas and billing

**Issue: Schema validation failures**
- Review constraint definitions in `semantic/constraints.js`
- Check domain ontology in `semantic/ontology.js`

**Issue: Low confidence scores**
- Provide more detailed requirements
- Add clarifications and context
- Check contamination detection results

## Dependencies

- **express** - Web server framework
- **axios** - HTTP client
- **zod** - Schema validation
- **dotenv** - Environment configuration

## Best Practices

1. **Detailed Requirements**: Provide clear, specific requirements for better schema generation
2. **Constraint Definition**: Define technical and business constraints upfront
3. **Iterative Refinement**: Use the repair engine to iteratively improve schemas
4. **Validation**: Always validate generated schemas before deployment
5. **Monitoring**: Track confidence scores and metrics for quality assurance

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Check the troubleshooting section
- Review debug output in `debug_res.json`
- Consult generated reports in `evaluation/reports/`

## Roadmap

- [ ] Support for GraphQL schema generation
- [ ] Multi-language output (Python, Go, Java)
- [ ] Advanced constraint solving
- [ ] Machine learning-based refinement
- [ ] Real-time collaboration features
- [ ] Schema versioning and migration tools

---

**Version**: 1.0.0  
**Last Updated**: 2026
