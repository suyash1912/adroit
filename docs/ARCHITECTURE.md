# Architecture Notes

## Data lifecycle

`src/domain.ts` defines the versioned app record. `src/storage.ts` validates the stored version and array fields when loading, falls back to defaults for malformed data, catches quota/storage errors, and exports a JSON backup. The app writes small records and preferences to `localStorage`; code drafts use separate `adroit.draft.*` keys and are size-limited. The user can export data or clear the app's records and drafts from Settings.

Original resume files are never persisted. Resume analysis stores a bounded text excerpt only after explicit consent. Interview answer text is stored as a draft so interrupted sessions survive refresh; browser storage is not encrypted. A browser's site-data controls can delete any of these records.

## Module boundaries

- `App.tsx` owns route composition, shared state, user workflows, and local feedback.
- `domain.ts` holds static catalogs and serializable domain types.
- `resume.ts` owns local PDF extraction and deterministic skill matching.
- `runner.ts` owns the one supported code execution path and output normalization.
- `storage.ts` owns local serialization and export operations.

## Scoring and execution

Resume match weights each selected role's core skills by 2 and secondary skills by 1. A supplied job description replaces the role catalog as the target list; only skills extracted from resume text count as evidence. Skills are detected using aliases and token boundaries. Code results compare JSON-compatible outputs with recursively sorted object keys; arrays remain ordered. The opaque-origin frame hosts a dedicated Worker, blocks network connections using CSP, bounds serialized output, and is removed after completion or timeout. It is designed for local practice, not adversarial execution.

Interview evaluation is a candidate self-rating against per-question reflection criteria. No algorithm claims to judge response quality. Kilo uses fixed, non-generative guidance with the browser SpeechSynthesis API only after the user enables voice. It has no microphone or speech-recognition path; browser voice support varies and the text prompt is always present.

## Static hosting

Vite emits static assets. `public/_redirects` supplies a Netlify-style rewrite for client-side routes. Other static hosts should rewrite unknown paths to the SPA entry point. No runtime server is part of the architecture.