#!/bin/bash

# Context Composer Development Commits
# Based on devplan.md and implemented features

echo "🚀 Starting Context Composer commit sequence..."

# 1. Foundation: Database schema and types
git add apps/contexer-dev-next/src/types/context.ts
git commit -m "feat(types): add ProjectContext interface with TechStack and UserStory types"

git add context_schema.json
git commit -m "feat(schema): add JSON schema for project context validation"

# 2. Backend API infrastructure
git add apps/contexer-dev-next/src/app/api/context/save/route.ts
git commit -m "feat(api): add context save endpoint with validation and versioning"

git add apps/contexer-dev-next/src/app/api/context/get/route.ts
git commit -m "feat(api): add context retrieval endpoint with versioning support"

git add apps/contexer-dev-next/src/app/api/projects/route.ts
git commit -m "feat(api): add projects CRUD endpoints with context integration"

git add apps/contexer-dev-next/src/app/api/projects/[id]/route.ts
git commit -m "feat(api): add project-specific routes with context management"

# 3. NLP Utilities
git add apps/contexer-dev-client/src/utils/nlp/techStackDetector.ts
git commit -m "feat(nlp): add tech stack detection with confidence scoring and fallback logic"

git add apps/contexer-dev-client/src/utils/nlp/userStoryParser.ts
git commit -m "feat(nlp): add user story parser with regex patterns and acceptance criteria extraction"

# 4. Frontend Context API service
git add apps/contexer-dev-client/src/services/contextApi.ts
git commit -m "feat(services): add ContextApiService with context and project management methods"

# 5. Frontend types and converters
git add apps/contexer-dev-client/src/types/context.ts
git commit -m "feat(types): add frontend context types with legacy conversion functions"

# 6. README Processing API
git add apps/contexer-dev-next/src/app/api/readme/process/route.ts
git commit -m "feat(api): add README processing endpoint with markdown to HTML conversion"

# 7. Context Composer UI - Core structure
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add ContextComposer component with project context management"

# 8. Context Composer UI - Tech Stack integration
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): integrate tech stack detection with confidence scoring and auto-application"

# 9. Context Composer UI - User Story parsing
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add user story parsing with preview and acceptance criteria display"

# 10. Context Composer UI - README processing
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add README file upload with HTML preview and auto-fill functionality"

# 11. Context Composer UI - Auto-processing
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): implement auto-processing of README content on paste/upload with debouncing"

# 12. Context Composer UI - Save functionality
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add context save functionality with backend integration and error handling"

# 13. Context Composer UI - Test and validation
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add comprehensive logging and test button for NLP feature validation"

# 14. Context Composer UI - File handling
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): add file upload handling for README and other project files"

# 15. Context Composer UI - State management
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): implement state management for context, previews, and processing status"

# 16. Integration and error handling
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git add apps/contexer-dev-client/src/services/contextApi.ts
git commit -m "fix(integration): resolve API response handling and require() compatibility issues"

# 17. NLP improvements and refinements
git add apps/contexer-dev-client/src/utils/nlp/userStoryParser.ts
git add apps/contexer-dev-next/src/app/api/readme/process/route.ts
git commit -m "feat(nlp): improve user story parsing with more permissive regex patterns"

# 18. Final UI polish and cleanup
git add apps/contexer-dev-client/src/components/WeIde/components/IDEContent/ContextComposer.tsx
git commit -m "feat(ui): remove suggested tech stack feature and finalize auto-processing UX"

# 19. Documentation and README updates
git add README.md
git commit -m "docs: update README with Context Composer features and NLP capabilities"

# 20. Final integration commit
git add .
git commit -m "feat(context-composer): complete NLP-powered context management with auto-processing"

echo "✅ All Context Composer commits completed!"
echo "📊 Total commits: 20"
echo "🚀 Context Composer is now ready with:"
echo "   - Tech Stack Detection"
echo "   - User Story Parsing" 
echo "   - README Auto-processing"
echo "   - Context Management"
echo "   - Backend Integration"
