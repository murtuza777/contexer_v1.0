# Context Composer Changelog

## 1. Auto-process README on paste/upload (debounced)
- Trigger README processing automatically with a 600ms debounce on paste or upload.

## 2. Dedicated README processing response handling
- Frontend handles `{ html, context, sections }` shape directly for README API.

## 3. Restore generic API response handler
- Reverted generic handler to avoid coupling to README endpoint.

## 4. Safer merge from README
- Update goal and user stories only; do not auto-apply techs.

## 5. Remove README tech suggestions UI
- Removed suggestion UI and any auto-select behavior for tech stack.

## 6. Tech stack detection from description
- Detects and recommends a single canonical tech with confidence.

## 7. Parser: support “I can …” stories
- Regex accepts “I can …” and optional “to”; action min words now 2.

## 8. Backend story regex aligned with frontend
- Same permissive pattern used in API for consistent extraction.

## 9. Detailed operational logging
- Added logs for project load, save, README processing, detection.

## 10. Save flow hardening
- Derive safe project name; handle update vs create paths.

## 11. UI: test hook
- Added test trigger for verifying NLP functions quickly.


