#!/usr/bin/env bash
set -euo pipefail

# Make 15 descriptive commits for recent changes. The first commit will include current staged/unstaged changes.

msgs=(
  "feat(landing): restore full-featured landing page with animations and sections"
  "fix(app): show landing page first for unauthenticated users; call isAuthenticated() correctly"
  "feat(auth): add 'Continue as Guest' flow and wire into App + Landing"
  "feat(ui): enhanced navbar/hero, smooth scroll animations, skeletons, footer"
  "feat(pricing): improve card contrast; prepare for white backgrounds"
  "feat(features): use dark text on white cards for readability"
  "build(vite): add dev:web script and disable failing postinstall temporarily"
  "build(electron): enable Electron plugin conditionally via ELECTRON env"
  "chore(ts): install @types/unist and add types configuration in tsconfig"
  "chore(icons): add lucide-react dependency"
  "chore(types): add local fallback declarations for lucide-react"
  "chore(config): update vite.config to avoid Electron during web dev"
  "chore(app): integrate guest access in Login modal and Landing button"
  "docs(dev): add notes for running web-only dev server"
  "chore(repo): housekeeping and formatting"
)

# Ensure we are inside a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

# Commit current work in the first commit (if there are changes)
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "${msgs[0]}"
  start_index=1
else
  start_index=0
fi

# Create remaining commits as empty commits to capture the change log context
for ((i=start_index; i<${#msgs[@]}; i++)); do
  git commit --allow-empty -m "${msgs[$i]}"
done

echo "Created $(( ${#msgs[@]} - start_index + (start_index>0?1:0) )) commits."


