# 🚀 Contexer - Autonomous AI Development Platform

![Contexer Preview](https://img.shields.io/badge/Status-MVP-blue) ![React](https://img.shields.io/badge/React-19.x-blue) ![Next.js](https://img.shields.io/badge/Next.js-15.x-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Team Roles & Responsibilities](#-team-roles--responsibilities)
- [Development Timeline](#-development-timeline)
- [Phase Details](#-phase-details)
- [Day-by-Day Execution](#-day-by-day-execution)
- [Kanban Board](#-kanban-board)
- [Team Assignment Summary](#-team-assignment-summary)
- [Critical Path Dependencies](#-critical-path-dependencies)
- [Critical Blockers](#-critical-blockers)

## 🎯 Project Overview

Contexer is a next-generation autonomous development platform featuring an AI agent that visually observes, understands, and builds web applications based on user-defined context. The platform combines intelligent prompt generation, real-time visual monitoring, automatic error resolution, and progress tracking to deliver a seamless autonomous development experience.

### User Journey
Landing Page → Authentication → Dashboard → Feature Selection → Autonomous Development

### Core Flow
1. Landing & Authentication: Users discover the platform and authenticate
2. Dashboard Access: Central hub with 6 powerful features
3. Context Definition: Users describe their project vision
4. Autonomous Building: AI agent builds while visually observing
5. Progress Monitoring: Real-time tracking and intervention capabilities

## 👥 Team Roles & Responsibilities

* **Murtuza (You)**: Backend architecture, AI agent coordination, prompt engineering
* **Safi**: AI model integration, error fixing logic, terminal processing
* **Waji**: Database schema, auth system, security hardening
* **Basheer**: UI/UX implementation, visual design, animations

## 📅 Development Timeline

| Week | Milestone | Team Checkpoint |
|------|-----------|----------------|
| Week 1 | Foundation Complete | Daily standups at 10am |
| Week 2 | Core Features Working | Feature integration demo |
| Week 3 | Full Integration | End-to-end workflow test |
| Week 4 | Polished MVP | Public alpha launch |

## 🧱 Phase Details

### Foundation Setup (Days 1-3)
*Database & Auth (Waji)*
- **Day 1: Database Schema**
  - Add `context JSONB` column to existing `projects` table
  - Create `agent_memory` table: `project_id`, `state`, `last_error`, `fix_suggestion`
  - Create `error_fixes` table: `project_id`, `error_hash`, `diff`, `applied`
  - Set up Row Level Security policies for all new tables
  - *Deliverable*: Complete schema diagram with relationships

- **Day 2: Authentication System**
  - Configure Supabase Auth with Email + Google providers
  - Implement session management for active projects
  - Set up project ownership validation
  - Create API route protection middleware
  - *Deliverable*: Protected API routes that require authentication

- **Day 3: Security Foundation**
  - Implement data encryption for sensitive fields
  - Set up error log truncation (only store last 10 lines)
  - Create isolated project build containers
  - Configure CORS policies for API routes
  - *Deliverable*: Security audit report with implemented measures

*Terminal Proxy (Safi & Murtuza)*
- **Day 1: Terminal Streaming**
  - Create `/api/terminal` route that captures `npm run dev` output
  - Implement WebSocket streaming for real-time logs
  - Set up project path validation to prevent path traversal
  - *Deliverable*: Terminal API that streams logs to frontend

- **Day 2: Error Detection System**
  - Implement regex-based error tagging:
    - `/ERROR/` for general errors
    - `/Module not found/` for dependency issues
    - `/Failed to compile/` for build failures
  - Create error categorization system
  - Set up error event broadcasting
  - *Deliverable*: Error detection that triggers events for Visual Observer

- **Day 3: Terminal Integration**
  - Connect terminal API to project management system
  - Implement project-specific terminal sessions
  - Add terminal session persistence
  - Create error history tracking
  - *Deliverable*: Terminal that shows build logs for specific projects

*UI Foundation (Basheer)*
- **Day 1: Dashboard Structure**
  - Create main dashboard layout with sidebar
  - Implement project selection component
  - Design terminal panel placeholder
  - Set up routing for project views
  - *Deliverable*: Basic dashboard with project navigation

- **Day 2: Terminal UI**
  - Build terminal panel with collapsible sections
  - Implement error highlighting (red background)
  - Add timestamp to each log entry
  - Create error summary panel
  - *Deliverable*: Terminal UI that displays logs with error highlighting

- **Day 3: UI State Management**
  - Implement state tracking for terminal sessions
  - Create loading states for API interactions
  - Set up error display system
  - Add responsive layout adjustments
  - *Deliverable*: Fully functional terminal UI that connects to backend

### Context Composer (Days 4-5)
*Database & Security (Waji)*
- **Context Structure Definition**
  - Finalize JSON schema for context 
    ```json
    {
      "goal": "string",
      "user_stories": [
        {"id": "string", "description": "string", "acceptance_criteria": ["string"], "status": "pending/complete"}
      ],
      "tech_stack": "string"
    }
    ```
  - Implement context validation constraints
  - Set up context versioning system
  - *Deliverable*: Validated context schema with versioning

- **Context Security**
  - Implement RLS policies for context data
  - Create context access controls
  - Set up context change auditing
  - *Deliverable*: Secure context storage with audit trail

*Backend & AI (Murtuza & Safi)*
- **Context API Endpoints**
  - Build `/api/context/save` endpoint with validation
  - Create `/api/context/get` endpoint with versioning
  - Implement context diff engine
  - *Deliverable*: Working API for context management

- **Context Processing**
  - Develop context parser that converts natural language to structured data
  - Create tech stack detector
  - Implement user story extractor
  - *Deliverable*: Context processing that generates structured data

- **Viber Integration**
  - Connect context data to Viber state machine
  - Implement context-aware progress tracking
  - Create context debugging endpoint
  - *Deliverable*: Viber that uses context for decision making

*UI/UX (Basheer)*
- **Context Input Components**
  - Create goal description area (rich text editor)
  - Design user stories section with add/remove capability
  - Implement tech stack selector
  - Add README.md uploader with preview
  - *Deliverable*: Structured context input form

- **Context Visualization**
  - Build context status indicators
  - Create feature completion visualization
  - Design context change history viewer
  - *Deliverable*: Visual representation of context data

- **User Experience Flow**
  - Design onboarding sequence for new users
  - Create context validation feedback
  - Implement progress indicators
  - *Deliverable*: Smooth context creation workflow

### Visual Observer (Days 6-7)
*Database & Security (Waji)*
- **Observation Data Storage**
  - Add `feature_status` field to context structure
  - Create validation history table
  - Set up feature validation tracking
  - *Deliverable*: Database schema for feature validation

- **Security for Validation**
  - Implement validation data isolation
  - Create validation result auditing
  - Set up safe DOM access policies
  - *Deliverable*: Secure validation data storage

*Backend & AI (Murtuza & Safi)*
- **Observation System**
  - Develop DOM monitoring for feature validation
  - Create terminal log analyzer
  - Implement feature completeness calculator
  - *Deliverable*: Backend system that validates features

- **Validation Engine**
  - Design rule-based validation system
  - Create validation confidence scoring
  - Implement validation history tracking
  - *Deliverable*: Validation engine that checks feature implementation

- **Integration Points**
  - Connect validation results to Viber
  - Link validation data to error fixing
  - Implement context-aware validation
  - *Deliverable*: Working integration between components

*UI/UX (Basheer)*
- **Preview Enhancement**
  - Modify existing preview iframe
  - Implement feature validation overlay
  - Create progress tracker
  - *Deliverable*: Preview with feature status indicators

- **Monitoring UI**
  - Design terminal panel with error highlighting
  - Implement feature status dashboard
  - Add build progress visualization
  - *Deliverable*: Visual monitoring interface

- **User Interaction**
  - Build manual validation tools
  - Implement screenshot capture
  - Add validation reporting
  - *Deliverable*: Interactive validation tools

### Viber - AI Agent (Days 8-10)
*Database & Security (Waji)*
- **Agent Memory System**
  - Finalize `agent_memory` table structure
  - Implement state transition logging
  - Set up memory access controls
  - *Deliverable*: Complete agent memory storage

- **Security for Agent Actions**
  - Create action approval tracking
  - Implement safety checks for agent decisions
  - Set up agent action auditing
  - *Deliverable*: Secure agent action system

*Backend & AI (Murtuza & Safi)*
- **State Machine**
  - Build Viber state machine with states:
    - idle
    - building
    - validating
    - error
    - fixing
    - approval
    - complete
  - Implement state transition rules
  - Create state persistence
  - *Deliverable*: Working state machine

- **Orchestration Engine**
  - Develop decision rules engine
  - Implement priority system for features
  - Create task queue management
  - *Deliverable*: Viber that orchestrates the workflow

- **Prompt Engineering**
  - Create structured prompt templates
  - Implement context-aware prompting
  - Design prompt versioning
  - *Deliverable*: Effective prompts for all scenarios

*UI/UX (Basheer)*
- **Agent Interface**
  - Create Viber activation panel
  - Design agent status panel
  - Implement agent memory visualization
  - *Deliverable*: Viber UI components

- **User Interaction**
  - Build approval workflow
  - Create agent reasoning visualization
  - Implement manual override
  - *Deliverable*: User interaction with Viber

- **Visual Design**
  - Create animated state indicators
  - Design agent memory visualization
  - Implement agent confidence indicators
  - *Deliverable*: Polished Viber visual design

### Error Fixer (Days 11-13)
*Database & Security (Waji)*
- **Error Tracking System**
  - Finalize `error_fixes` table structure
  - Implement error pattern recognition
  - Set up fix success tracking
  - *Deliverable*: Complete error tracking database

- **Security for Fixes**
  - Create diff sanitization system
  - Implement safety checks for diffs
  - Set up approval tracking
  - *Deliverable*: Secure fix application system

*Backend & AI (Murtuza & Safi)*
- **Error Handling System**
  - Build error classification system
  - Create error pattern database
  - Implement error severity scoring
  - *Deliverable*: Error classification system

- **Fix Generation**
  - Develop diff generation pipeline
  - Implement diff validation
  - Create safety checks
  - *Deliverable*: Working fix generation

- **Integration Points**
  - Connect to terminal error detection
  - Link to context composer data
  - Implement validation feedback loop
  - *Deliverable*: Integrated error fixing system

*UI/UX (Basheer)*
- **Fix Interface**
  - Create diff viewer component
  - Design approval workflow
  - Implement revert functionality
  - *Deliverable*: Fix approval UI

- **Error Visualization**
  - Build error context viewer
  - Create error severity indicators
  - Implement error history timeline
  - *Deliverable*: Error visualization system

- **User Experience**
  - Develop fix confidence indicators
  - Create fix explanation system
  - Implement manual fix override
  - *Deliverable*: Smooth fix approval experience

### Security & Polish (Days 14-15)
*Security (Waji)*
- **Build Isolation**
  - Implement project build containers
  - Create file system sandboxing
  - Design process isolation
  - *Deliverable*: Secure build environment

- **Data Protection**
  - Design error log truncation
  - Implement context data encryption
  - Create privacy-preserving analytics
  - *Deliverable*: Secure data handling

*Backend & AI (Murtuza & Safi)*
- **Performance Optimization**
  - Implement lazy loading
  - Create efficient state management
  - Design optimized data fetching
  - *Deliverable*: Optimized backend performance

- **Error Handling**
  - Build comprehensive error logging
  - Create user-friendly error messages
  - Implement error recovery system
  - *Deliverable*: Robust error handling

*UI/UX (Basheer)*
- **Visual Design**
  - Create Viber activation animation
  - Design error highlighting system
  - Implement progress visualization
  - *Deliverable*: Polished visual design

- **User Experience**
  - Develop onboarding flow
  - Create help system
  - Implement keyboard shortcuts
  - *Deliverable*: Complete user experience

## 📅 15-Day Development Timeline

| Day | Phase | Feature | Frontend Tasks | Backend Tasks | Database Tasks | AI Agent Tasks | Expected Deliverable | Dependencies |
|-----|-------|---------|----------------|---------------|----------------|----------------|----------------------|--------------|
| **1** | Foundation | Database Setup | - | - | • Add `context JSONB` to projects table<br>• Create `agent_memory` table<br>• Create `error_fixes` table | - | • Supabase tables ready for Contexer | None |
| **2** | Foundation | Terminal Proxy | • Modify preview iframe to show terminal logs<br>• Implement error highlighting UI<br>• Add terminal panel to dashboard | • Create `/api/terminal` route<br>• Implement WebSocket streaming<br>• Add error detection regex | • Add `terminal_logs` field to projects | - | • Live terminal logs visible in UI with errors highlighted | Database tables from Day 1 |
| **3** | Foundation | Context Infrastructure | • Replace prompt input with structured form<br>• Add user stories section<br>• Implement tech stack selector | • Create `/api/context/save`<br>• Create `/api/context/get`<br>• Implement context validation | • Verify `context` column works | • Build context parser | • Structured context form saves to DB | Terminal proxy working |
| **4** | Core Features | Error Fixer UI | • Build diff viewer component<br>• Create fix approval panel<br>• Add revert functionality | • Create `/api/fix-error` skeleton<br>• Implement diff sanitization | • Verify `error_fixes` table works | • Design fix prompt template | • Clicking error shows placeholder fix UI | Context infrastructure working |
| **5** | Core Features | Error Fixer Backend | - | • Complete `/api/fix-error`<br>• Implement error classification<br>• Connect to Mistral 7B via Ollama | • Test error hash generation | • Build fix prompt engine<br>• Implement safety checks | • Terminal error → API returns valid diff | Error Fixer UI complete |
| **6** | Core Features | Visual Observer | • Add progress tracker UI<br>• Implement feature validation overlay<br>• Create error history panel | • Build log analyzer<br>• Implement progress calculator<br>• Add screenshot capture | • Add `feature_status` field | • Build feature validator | • Progress bar moves as build progresses | Terminal proxy working |
| **7** | Core Features | Viber UI | • Create Viber avatar animation<br>• Build status panel<br>• Add control buttons (Start/Pause/Revert) | • Create `/api/viber` skeleton<br>• Implement state tracking | • Verify agent_memory table works | • Design state transition rules | • Viber UI appears with animated avatar | Visual Observer working |
| **8** | Core Features | Viber Backend | - | • Complete Viber state machine<br>• Implement memory persistence<br>• Connect to Error Fixer | • Test state transitions | • Build decision rules engine | • Click "Start Viber" → monitors build → detects error | Viber UI complete |
| **9** | Integration | Context Integration | • Add context debugging panel<br>• Show current context in UI | • Enhance prompt engine<br>• Connect context to Viber | • Test context versioning | • Make prompts context-aware | • Fix suggestions reference user stories | Error Fixer + Viber working |
| **10** | Integration | Full Build Loop | • Connect all UI components<br>• Implement approval workflow | • Complete integration points<br>• Fix state transition bugs | • Verify all tables connected | • Refine decision logic | • End-to-end flow: Context → Build → Error → Fix → Approval | All core features working |
| **11** | Polish | UI Enhancements | • Add Viber activation animation<br>• Implement error highlighting<br>• Create diff approval flow | • Add API response caching<br>• Implement loading states | • Add performance metrics | • - | • Smooth UI transitions between states | Full build loop working |
| **12** | Security | Security Hardening | • Add security indicators<br>• Implement revert confirmation | • Isolate project builds<br>• Implement diff sanitization<br>• Add auth to all API routes | • Add security audit fields | • Enhance safety checks | • Dangerous commands blocked in fix suggestions | UI enhancements complete |
| **13** | Security | Privacy Features | • Add privacy indicators<br>• Implement error log truncation UI | • Implement log truncation<br>• Add data encryption | • Verify privacy settings | • - | • Only last 10 error lines stored | Security hardening complete |
| **14** | Final | Deployment Prep | • Build demo tour<br>• Create launch checklist | • Configure Cloudflare Tunnel<br>• Set up Vercel deployment | • Verify production DB | • - | • Deployment configuration complete | All features integrated |
| **15** | Final | MVP Launch | • Record demo video<br>• Final UI polish | • Final bug fixes<br>• Performance tuning | • Data backup | • Final prompt tuning | • Public MVP ready for launch | Deployment prep complete |

## 🗂️ Kanban Board Representation

### To Do
- **Database Setup** (Day 1) - Waji
- **Terminal Proxy** (Day 2) - Safi & Murtuza
- **Context Infrastructure** (Day 3) - Basheer

### In Progress
- **Error Fixer UI** (Day 4) - Basheer
- **Error Fixer Backend** (Day 5) - Safi
- **Visual Observer** (Day 6) - Basheer & Safi

### Review/QA
- **Viber UI** (Day 7) - Basheer
- **Viber Backend** (Day 8) - Murtuza & Safi
- **Context Integration** (Day 9) - Murtuza

### Done
- **Database Setup** (Day 1) - Waji
- **Terminal Proxy** (Day 2) - Safi & Murtuza
- **Context Infrastructure** (Day 3) - Basheer

## 🧑‍🤝‍🧑 Team Assignment Summary

| Role | Responsibilities | Key Days |
|------|-----------------|----------|
| **Waji** (Security/DB) | Database setup, security hardening, auth system | Days 1, 12-13 |
| **Murtuza** (AI/Backend) | Viber core, prompt engineering, state machine | Days 7-9, 11 |
| **Safi** (AI/Backend) | Error Fixer, terminal processing, AI integration | Days 4-6, 10 |
| **Basheer** (UI/UX) | All frontend components, animations, UI polish | Days 3-8, 11, 14-15 |

## 🔑 Critical Path Dependencies

1. **Terminal Proxy (Day 2) → Everything Else**  
   Without terminal visibility, Viber is blind and can't detect errors

2. **Context Infrastructure (Day 3) → Viber (Days 7-8)**  
   Without structured context, Viber can't generate meaningful prompts

3. **Error Fixer (Days 4-5) → Visual Observer (Day 6)**  
   Error detection must work before validation can occur

4. **Viber Backend (Day 8) → Context Integration (Day 9)**  
   State machine must work before context can drive decisions

## 🚨 Critical Blockers to Watch For

| Day | Potential Blocker | Mitigation Strategy |
|-----|-------------------|---------------------|
| 2 | Terminal logs not streaming | Verify WebSocket CORS configuration |
| 5 | Ollama not responding to API | Confirm Cloudflare Tunnel is properly configured |
| 8 | Viber state machine resets | Verify agent_memory table is being updated correctly |
| 10 | Fix suggestions don't match context | Add debug logging to prompt generation |

## 🔄 Daily Standup Structure (10am)

1. **Waji**: Database/security progress (5 mins)
   - "Yesterday I built X, today I'll do Y, blockers Z"
   - Focus on what others need from you

2. **Murtuza & Safi**: Backend/AI progress (10 mins)
   - "We integrated X with Y, next is Z"
   - Highlight dependencies for frontend

3. **Basheer**: UI/UX progress (5 mins)
   - "Built X component, need Y from backend"
   - Show screenshots of current work

4. **Blockers & Planning** (5 mins)
   - Address immediate blockers
   - Confirm next day's priorities

## 🚫 Critical Success Factors

1. **Terminal First**: If Safi's terminal proxy isn't working by Day 3, everything else fails
2. **No Auto-Fixes**: Waji must enforce approval requirement before fixes are applied
3. **Context is King**: Murtuza must ensure all AI actions reference project context
4. **Progress Visibility**: Basheer must make Viber's state always visible to users
5. **Security First**: Waji must implement safety checks before any deployment

This plan gives each team member clear tasks with specific deliverables. The key is maintaining communication - when Safi completes error detection, Murtuza can immediately start building the fix generator, while Basheer prepares the UI for it. Start with Foundation (Days 1-3), and the rest will follow naturally. Good luck team! 🚀
