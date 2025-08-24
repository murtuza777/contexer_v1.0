#!/usr/bin/env bash
set -euo pipefail

# Batch UI commits script
# Run from the repo root: ./commits.sh
# The script will create commits only if the referenced files have changes.

commit_always() {
  local msg="$1"; shift
  local paths=("$@")
  git add -A -- ${paths[@]}
  git commit -m "$msg"
  echo "Committed: $msg"
}

# 0) Ensure frontend app (if newly added) is committed
commit_always "chore(frontend): add frontend app to repo" \
  apps/contexer-dev-frontend

# 1) Chat input: Chat/Builder toggle and icons
commit_always "feat(chat-input): add mode toggle with chat/code icons" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 2) Chat input: icon import fix
commit_always "fix(chat-input): correct chat icon import (MessagesSquare)" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 3) Chat input: button title reflects current mode
commit_always "style(chat-input): improve toggle button title for mode switch" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 4) Upload button: keep compatible icon
commit_always "chore(upload): retain FileText icon for compatibility" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/UploadButtons.tsx

# 5) Message item: sanitize user content
commit_always "fix(message-item): safely clone and sanitize user content" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/MessageItem/index.tsx

# 6) Message item: strip weD2c tags from parts text
commit_always "refactor(message-item): remove weD2c tags from content and parts" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/MessageItem/index.tsx

# 7) Terminal: nullable refs and process id
commit_always "fix(terminal): allow nullable containerRef and processId" \
  apps/contexer-dev-frontend/src/components/WeIde/components/Terminal/index.tsx

# 8) Terminal: guard initialize by ref/id
commit_always "fix(terminal): guard terminal.initialize with ref and id presence" \
  apps/contexer-dev-frontend/src/components/WeIde/components/Terminal/index.tsx

# 9) Terminal: show only active process terminal
commit_always "style(terminal): hide inactive terminals via selectProcessId" \
  apps/contexer-dev-frontend/src/components/WeIde/components/Terminal/index.tsx

# 10) Chat input: upload overlay and loading UX polish
commit_always "style(chat-input): polish uploading overlay and thinking state visuals" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 11) Chat input: mention menu positioning/responsive updates
commit_always "style(chat-input): keep mention menu positioned on resize" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 12) Chat input: refactor event handling for mentions
commit_always "refactor(chat-input): streamline @mention selection and deletion logic" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 13) Chat input: add optimized prompt UI hook-in
commit_always "chore(chat-input): integrate OptimizedPromptWord panel in toolbar" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 14) L10N: placeholders and titles
commit_always "i18n(chat-input): align placeholder/title strings with mode" \
  apps/contexer-dev-frontend/src/components/AiChat/chat/components/ChatInput/index.tsx

# 15) Final sweep: commit remaining UI tweaks
git add -A -- apps/contexer-dev-frontend/src/components
git commit -m "chore(ui): sweep minor UI tweaks across components"
echo "Committed: chore(ui): sweep minor UI tweaks across components"

echo "Done."
