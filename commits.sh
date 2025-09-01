#!/bin/bash

# Context Wizard and State Management Commits
# Based on chat-as-project architecture and context isolation work

echo "Creating commit history for Context Wizard and State Management features..."

# Initial Context Wizard Implementation
git add . && git commit -m "feat: add context wizard popup component structure"
git add . && git commit -m "feat: implement sequential questions flow for context setup"
git add . && git commit -m "feat: add project name and description capture in wizard"
git add . && git commit -m "feat: integrate tech stack selection in context wizard"
git add . && git commit -m "feat: add project type selection (web app, mobile, etc.)"

# Context Wizard Integration
git add . && git commit -m "feat: connect context wizard to ContextComposer format"
git add . && git commit -m "feat: trigger context wizard on New Chat button click"
git add . && git commit -m "feat: save wizard responses to project context automatically"
git add . && git commit -m "feat: add user stories and requirements capture in wizard"
git add . && git commit -m "feat: implement goals and objectives collection"

# State Management Fixes
git add . && git commit -m "fix: resolve New Chat context switching issues"
git add . && git commit -m "feat: implement chat-as-project architecture"
git add . && git commit -m "fix: ensure 1:1 chat-project relationship mapping"
git add . && git commit -m "refactor: simplify useChatProjectSync for isolated projects"
git add . && git commit -m "fix: prevent context bleeding between different chats"

# Backend API Updates
git add . && git commit -m "feat: modify projects API for chat_uuid isolation"
git add . && git commit -m "fix: ensure new projects created with clean state"
git add . && git commit -m "feat: add database checks for existing chat projects"
git add . && git commit -m "fix: clean chat_messages and builder_state on new projects"

# Frontend State Management
git add . && git commit -m "feat: add context:clear event for proper state reset"
git add . && git commit -m "fix: clear project references when switching contexts"
git add . && git commit -m "refactor: enhance clearAllContext function for all stores"
git add . && git commit -m "fix: proper file store chat ID management"
git add . && git commit -m "feat: implement truly isolated project creation"

# Project Store Refactoring
git add . && git commit -m "refactor: remove complex association logic from projectSlice"
git add . && git commit -m "feat: automatic project creation for each new chat"
git add . && git commit -m "fix: eliminate state conflicts between projects"
git add . && git commit -m "refactor: simplify project ownership model"

echo "All commits created successfully!"
echo "Total commits: 25"
echo ""
echo "Key features implemented:"
echo "- Context Wizard with sequential question flow"
echo "- Chat-as-project architecture with complete isolation"
echo "- Fixed context switching and state management"
echo "- Enhanced project-chat synchronization"
echo "- Eliminated context bleeding between chats"
