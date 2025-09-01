# 🎯 Visual Observer Development Plan (vodev.md)

## 📋 Executive Summary

The Visual Observer leverages your **existing user story parsing** to create a streamlined Playwright-based validation system. Since you already have structured acceptance criteria, we can skip complex AI parsing and focus on reliable test execution.

## 🔍 Current State Analysis

### ✅ Existing Assets
- **User Story Parser**: `parseAndEnhanceUserStories()` generates structured `UserStory[]` with `acceptance_criteria`
- **Context System**: Full JSONB storage with API endpoints for context management
- **Project Isolation**: Chat-as-project architecture provides clean test environments
- **Terminal Integration**: WebSocket streaming and error detection already implemented
- **Type Safety**: Complete TypeScript interfaces for `UserStory`, `ProjectContext`

### 🚫 Missing Components
- Playwright dependency and configuration
- Story-to-test mapping engine
- Test execution and validation system
- Visual validation capabilities
- Integration with existing error handling

## 🚀 Implementation Strategy

### Phase 1: Direct Playwright Integration (Days 1-2)
**Goal**: Use existing parsed stories directly with Playwright

#### Day 1: Story-to-Test Mapping
**What You Build**:
```typescript
// New file: src/utils/visual-observer/storyMapper.ts
interface TestAction {
  type: 'click' | 'fill' | 'expect' | 'navigate';
  selector: string;
  value?: string;
  expected?: string;
}

function mapAcceptanceCriteriaToTests(criteria: string[]): TestAction[] {
  // Convert "User can click login button" → { type: 'click', selector: '[data-testid="login"]' }
}
```

**Integration Points**:
- Use existing `parseAndEnhanceUserStories()` from Context Composer
- Map structured acceptance criteria to Playwright actions
- Generate smart selectors based on common UI patterns

#### Day 2: Test Execution Engine
**What You Build**:
```typescript
// New file: src/utils/visual-observer/testExecutor.ts
class PlaywrightExecutor {
  async executeStory(story: UserStory, projectUrl: string): Promise<ValidationResult>
  async validateAcceptanceCriteria(criteria: string[]): Promise<CriteriaResult[]>
}
```

**Features**:
- Execute tests against local development server
- Capture screenshots on failures
- Generate validation reports with confidence scores

### Phase 2: Enhanced Validation (Days 3-4)
**Goal**: Make Playwright smarter using your parsed data

#### Day 3: Smart Selector Generation
**What You Build**:
- Selector strategies based on parsed element descriptions
- Fallback mechanisms (data-testid → aria-label → text content)
- Validation confidence scoring based on selector reliability

#### Day 4: Error Integration
**What You Build**:
- Integration with existing terminal error detection
- Screenshot capture on validation failures
- Connection to Error Fixer component for automated fixes

### Phase 3: Minimal AI Enhancement (Days 5-6)
**Goal**: Add only essential AI features

#### Day 5: Visual Validation (Optional)
**What You Add**:
- Screenshot analysis for visual requirements
- Layout validation for design-focused criteria
- Only if acceptance criteria include visual requirements

#### Day 6: Adaptive Improvements (Optional)
**What You Add**:
- Learning from validation accuracy
- Selector strategy optimization
- Continuous improvement based on success rates

## 📁 File Structure

```
src/
├── components/
│   └── WeIde/
│       └── components/
│           └── VisualObserver/
│               ├── index.tsx                    # Main Visual Observer component
│               ├── ValidationPanel.tsx          # Validation results display
│               ├── TestRunner.tsx              # Test execution controls
│               └── ScreenshotViewer.tsx        # Screenshot analysis
├── utils/
│   └── visual-observer/
│       ├── storyMapper.ts                      # Story → Test mapping
│       ├── testExecutor.ts                     # Playwright execution
│       ├── selectorGenerator.ts               # Smart selector logic
│       └── validationEngine.ts                # Validation scoring
├── services/
│   └── visualObserverApi.ts                   # API endpoints
└── types/
    └── visualObserver.ts                      # TypeScript interfaces
```

## 🔧 Technical Implementation

### Story Mapping Logic
```typescript
// Example: Your existing parsed story structure
const story: UserStory = {
  id: "story_1",
  description: "As a user, I want to log in successfully",
  acceptance_criteria: [
    "User can click login button",
    "User can fill email field with test@example.com", 
    "User can expect success message to appear"
  ],
  status: "pending"
};

// Maps to Playwright actions
const testActions: TestAction[] = [
  { type: 'click', selector: '[data-testid="login-button"]' },
  { type: 'fill', selector: '[data-testid="email"]', value: 'test@example.com' },
  { type: 'expect', selector: '[data-testid="success-message"]', expected: 'Login successful' }
];
```

### Integration with Existing Systems
```typescript
// Leverage existing Context Composer data
const currentStories = parseAndEnhanceUserStories(context.userStories);

// Use existing terminal integration for build status
const buildStatus = await terminalApi.getBuildStatus(projectId);

// Connect to existing error handling
if (validationFailed) {
  await errorFixerApi.suggestFix(error, context);
}
```

## 📊 Dependencies & Setup

### New Dependencies
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "playwright": "^1.40.0"
  }
}
```

### Configuration Files
```javascript
// playwright.config.ts
export default {
  testDir: './src/tests/visual-observer',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## 🔗 API Endpoints

### New Backend Routes
```typescript
// /api/visual-observer/validate
POST /api/visual-observer/validate
{
  projectId: string,
  storyId: string,
  criteria: string[]
}

// /api/visual-observer/results
GET /api/visual-observer/results/:projectId
```

### Database Schema Updates
```sql
-- Add to existing projects table
ALTER TABLE projects ADD COLUMN validation_results JSONB;

-- New validation history table
CREATE TABLE validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  story_id TEXT,
  criteria TEXT[],
  results JSONB,
  screenshots TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Integration

### Visual Observer Panel
```typescript
// Integration with existing IDE layout
<WeIde>
  <IDEContent>
    <ContextComposer /> {/* Existing */}
    <VisualObserver />  {/* New component */}
    <Terminal />        {/* Existing */}
  </IDEContent>
</WeIde>
```

### Validation Display
- **Progress Tracker**: Shows validation progress for each story
- **Screenshot Gallery**: Visual evidence of validation results  
- **Error Integration**: Links validation failures to Error Fixer
- **Real-time Updates**: WebSocket integration for live validation status

## 📈 Success Metrics

### Phase 1 Success Criteria
- [ ] Parse existing user stories into Playwright tests
- [ ] Execute basic validation against local dev server
- [ ] Generate validation reports with pass/fail status
- [ ] Integrate with existing project isolation system

### Phase 2 Success Criteria  
- [ ] Smart selector generation with 80%+ success rate
- [ ] Screenshot capture on validation failures
- [ ] Integration with existing terminal error detection
- [ ] Confidence scoring for validation results

### Phase 3 Success Criteria
- [ ] Visual validation for design-focused criteria
- [ ] Adaptive selector improvement over time
- [ ] Full integration with Error Fixer workflow

## 🚨 Risk Mitigation

### Technical Risks
1. **Selector Reliability**: Implement multiple fallback strategies
2. **Performance Impact**: Use headless mode and optimize test execution
3. **Integration Complexity**: Leverage existing APIs and data structures

### Timeline Risks
1. **Playwright Learning Curve**: Start with simple test cases
2. **Integration Challenges**: Use existing patterns from Context Composer
3. **Scope Creep**: Focus on core validation, skip advanced AI features initially

## 🔄 Integration Timeline

### Day 1-2: Foundation
- Install Playwright and configure basic setup
- Implement story-to-test mapping using existing parser
- Create basic test execution engine

### Day 3-4: Enhancement  
- Add smart selector generation
- Integrate with existing error handling
- Implement screenshot capture

### Day 5-6: Polish
- Add visual validation capabilities (optional)
- Implement adaptive improvements (optional)
- Full integration testing with existing systems

## 🎯 Expected Outcomes

By leveraging your existing user story parsing, the Visual Observer will:

1. **Validate Features Automatically**: Convert acceptance criteria to executable tests
2. **Provide Visual Evidence**: Screenshots and validation reports
3. **Integrate Seamlessly**: Work with existing Context Composer and Error Fixer
4. **Scale Efficiently**: Use existing project isolation and API patterns
5. **Maintain Quality**: TypeScript interfaces and existing validation patterns

This approach maximizes your existing investments while delivering a powerful Visual Observer in just 4-6 days instead of the typical 10+ days for a full AI-powered solution.
