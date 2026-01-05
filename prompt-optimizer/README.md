# Prompt Optimizer

An AI-powered application for refining technical writing prompts. This tool helps developers, technical writers, and AI trainers optimize their prompts for documentation, tutorials, research papers, and more.

## Features

### Core Functionality
- **Real-time Prompt Analysis** - Get instant feedback on prompt quality
- **Multi-dimensional Scoring** - Evaluate clarity, specificity, structure, context, actionability, and completeness
- **Smart Suggestions** - Receive prioritized recommendations for improvement
- **Alternative Formats** - Access templates for API docs, whitepapers, tutorials, and more
- **Refinement Options** - Adjust tone, length, audience level, and structure

### User Interface
- Clean, minimalistic design with intuitive navigation
- Syntax highlighting for code blocks in prompts
- Auto-suggestions for prompt starters
- Dark mode support
- Responsive design for all devices
- Accessibility compliant (WCAG 2.1)

### Technical Writing Categories
- Software documentation
- User manuals
- Instructional guides
- Technical blog posts
- Research papers
- API documentation
- Technical whitepapers
- Tutorials and case studies

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Zustand** for state management
- **React Hook Form** with Zod validation

### Backend (Microservices)
- **API Gateway** - Request routing and rate limiting
- **NLP Service** - Prompt analysis and scoring
- **Data Service** - Prompt storage and retrieval
- **Auth Service** - User authentication
- **Integration Service** - External platform connections

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **PostgreSQL** for data persistence
- **Redis** for caching
- **Nginx** for frontend serving

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for full stack)

### Frontend Development

```bash
cd prompt-optimizer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Full Stack with Docker

```bash
cd prompt-optimizer/infrastructure/docker

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
cd prompt-optimizer/infrastructure/kubernetes

# Create namespace
kubectl apply -f namespace.yaml

# Apply configurations
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# Deploy services
kubectl apply -f deployment-gateway.yaml
kubectl apply -f deployment-nlp.yaml
kubectl apply -f deployment-frontend.yaml
```

## Project Structure

```
prompt-optimizer/
├── src/                        # Frontend source
│   ├── components/             # React components
│   │   ├── PromptInput/        # Main prompt editor
│   │   ├── ScorePanel/         # Score visualization
│   │   ├── SuggestionsPanel/   # Suggestions display
│   │   ├── RefinementPanel/    # Refinement options
│   │   └── ContextualQuestions/# Context gathering
│   ├── pages/                  # Page components
│   ├── services/               # Business logic
│   │   ├── nlpService.ts       # NLP analysis
│   │   ├── scoringService.ts   # Score calculation
│   │   └── suggestionService.ts# Suggestion generation
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # React context providers
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── styles/                 # Global styles
├── backend/                    # Backend microservices
│   ├── gateway/                # API Gateway
│   ├── nlp-service/            # NLP processing
│   ├── data-service/           # Data storage
│   ├── auth-service/           # Authentication
│   ├── integration-service/    # External integrations
│   └── shared/                 # Shared types
├── infrastructure/             # Deployment configs
│   ├── docker/                 # Docker files
│   └── kubernetes/             # K8s manifests
└── public/                     # Static assets
```

## API Endpoints

### NLP Service
- `POST /api/v1/analyze` - Analyze a prompt
- `POST /api/v1/analyze/batch` - Batch analysis

### Data Service
- `GET /api/v1/prompts` - List prompts
- `POST /api/v1/prompts` - Create prompt
- `GET /api/v1/prompts/:id` - Get prompt
- `PUT /api/v1/prompts/:id` - Update prompt
- `DELETE /api/v1/prompts/:id` - Delete prompt

### Auth Service
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Current user

### Integration Service
- `GET /api/v1/integrations` - List integrations
- `POST /api/v1/integrations/connect` - Connect platform
- `POST /api/v1/integrations/export` - Export prompt

## Scoring Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Clarity | 20% | Readability and precision of language |
| Specificity | 20% | Technical detail and constraints |
| Structure | 15% | Organization and formatting |
| Context | 15% | Background and audience definition |
| Actionability | 15% | Clear tasks and deliverables |
| Completeness | 15% | Coverage of essential elements |

## Configuration

### Environment Variables

```env
# Frontend
VITE_API_URL=/api/v1

# Backend
NODE_ENV=production
PORT=8080
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Integrations
GITHUB_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
NOTION_CLIENT_ID=...
```

## Security

- JWT-based authentication
- Rate limiting on all endpoints
- CORS configuration
- Helmet security headers
- Input validation with Zod
- Secrets management with Kubernetes

## License

MIT License - see LICENSE file for details.
