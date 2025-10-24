# TODO: Remove Lovable Details and Implement Generic AI Chat

## Information Gathered
- Lovable references found in: vite.config.ts (lovable-tagger import), package.json (lovable-tagger dep), README.md (full Lovable content), index.html (meta tags), supabase/functions/chat-ai/index.ts (Lovable AI gateway), package-lock.json (lovable-tagger).
- Project is a React + Vite + Supabase exam scheduler with AI chat feature.
- User wants to remove all Lovable branding and replace AI with generic OpenAI integration.

## Plan
1. Update package.json: Remove lovable-tagger, change name and description to generic.
2. Update vite.config.ts: Remove lovable-tagger import and usage.
3. Update README.md: Rewrite to generic project README without Lovable references.
4. Update index.html: Change title, description, meta tags to generic.
5. Update supabase/functions/chat-ai/index.ts: Replace Lovable AI gateway with OpenAI API.
6. Remove package-lock.json references if needed (but since it's generated, npm install will fix).
7. Test the changes.

## Dependent Files
- package.json
- vite.config.ts
- README.md
- index.html
- supabase/functions/chat-ai/index.ts

## Followup Steps
- Run npm install to update lockfile.
- Test the AI chat with OpenAI API key.
- Verify no Lovable references remain.

## Completed Tasks
- [x] Update package.json: Changed name to "exam-scheduler", removed lovable-tagger dependency
- [x] Update vite.config.ts: Removed lovable-tagger import and componentTagger plugin
- [x] Update README.md: Rewritten to generic project README with proper documentation
- [x] Update index.html: Changed title to "Exam Scheduler", updated meta tags, removed Lovable references
- [x] Update supabase/functions/chat-ai/index.ts: Replaced Lovable AI gateway with OpenAI API
- [x] Run npm install: Updated dependencies and lockfile
- [x] Remove dist folder: Cleaned up build artifacts with old Lovable references
