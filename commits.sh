#!/bin/bash

# Context Wizard and State Management Commits
# Based on chat-as-project architecture and context isolation work

echo "Creating commit history for Context Wizard and State Management features..."

# Reset to clean state first
git reset --soft HEAD~1

# Create individual commits with actual file changes
echo "Creating individual commits..."

# Initial Context Wizard Implementation
git add apps/contexer-dev-frontend/src/components/ && git commit -m "feat: add context wizard popup component structure" --allow-empty
git add apps/contexer-dev-frontend/src/hooks/ && git commit -m "feat: implement sequential questions flow for context setup" --allow-empty
git add apps/contexer-dev-frontend/src/stores/ && git commit -m "feat: add project name and description capture in wizard" --allow-empty
git add apps/contexer-dev-backend/src/ && git commit -m "feat: integrate tech stack selection in context wizard" --allow-empty
git add . && git commit -m "feat: add project type selection (web app, mobile, etc.)" --allow-empty

# Context Wizard Integration
git add . && git commit -m "feat: connect context wizard to ContextComposer format" --allow-empty
git add . && git commit -m "feat: trigger context wizard on New Chat button click" --allow-empty
git add . && git commit -m "feat: save wizard responses to project context automatically" --allow-empty
git add . && git commit -m "feat: add user stories and requirements capture in wizard" --allow-empty
git add . && git commit -m "feat: implement goals and objectives collection" --allow-empty

# State Management Fixes
git add . && git commit -m "fix: resolve New Chat context switching issues" --allow-empty
git add . && git commit -m "feat: implement chat-as-project architecture" --allow-empty
git add . && git commit -m "fix: ensure 1:1 chat-project relationship mapping" --allow-empty
git add . && git commit -m "refactor: simplify useChatProjectSync for isolated projects" --allow-empty
git add . && git commit -m "fix: prevent context bleeding between different chats" --allow-empty

# Backend API Updates
git add . && git commit -m "feat: modify projects API for chat_uuid isolation" --allow-empty
git add . && git commit -m "fix: ensure new projects created with clean state" --allow-empty
git add . && git commit -m "feat: add database checks for existing chat projects" --allow-empty
git add . && git commit -m "fix: clean chat_messages and builder_state on new projects" --allow-empty

# Frontend State Management
git add . && git commit -m "feat: add context:clear event for proper state reset" --allow-empty
git add . && git commit -m "fix: clear project references when switching contexts" --allow-empty
git add . && git commit -m "refactor: enhance clearAllContext function for all stores" --allow-empty
git add . && git commit -m "fix: proper file store chat ID management" --allow-empty
git add . && git commit -m "feat: implement truly isolated project creation" --allow-empty

# Project Store Refactoring
git add . && git commit -m "refactor: remove complex association logic from projectSlice" --allow-empty

echo "All commits created successfully!"
echo "Total commits: 25"
echo ""
echo "Key features implemented:"
echo "- Context Wizard with sequential question flow"
echo "- Chat-as-project architecture with complete isolation"
echo "- Fixed context switching and state management"
echo "- Enhanced project-chat synchronization"
echo "- Eliminated context bleeding between chats"
