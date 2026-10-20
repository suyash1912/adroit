# Architecture Notes

## Data lifecycle

`src/domain.ts` defines the versioned app record. `src/storage.ts` validates persisted records at runtime, migrates valid version-one records to version two, preserves malformed or unsupported records under timestamped recovery keys, catches storage failures, and exports a JSON backup. Version two adds `completedLearningItems`. The app writes small records and preferences to `localStorage`; code drafts use separate `adroit.draft.*` keys and are size-limited. The user can export data or clear the app's records, recovery copies, and drafts from Settings.

Original resume files are never persisted. Resume analysis stores a bounded text excerpt only after explicit consent. Interview answer text is stored with the session so interrupted sessions survive refresh; browser storage is not encrypted. A browser's site-data controls can delete any of these records.

## Module boundaries

- `App.tsx` owns route composition, shared state, user workflows, and local feedback.
- `domain.ts` holds static catalogs and serializable domain types.
- `learning.ts` derives role-aware recommendations from the current role, its latest saved analysis, actual coding attempts, and interview self-ratings. It does not call a remote model or claim proficiency.
- `demo.ts` returns a clearly synthetic sample resume analysis. Demo activity uses isolated in-memory app state; code drafts use a separate session-storage namespace and are removed on reset/exit.
- `resume.ts` owns local PDF extraction and deterministic skill matching.
- `runner.ts` owns the one supported code execution path and output normalization.
- `storage.ts` owns local serialization and export operations.

## Scoring and execution

Resume match weights each selected role's core skills by 2 and secondary skills by 1. A supplied job description replaces the role catalog as the target list; only skills extracted from resume text count as evidence. Skills are detected using aliases and token boundaries. Code results compare JSON-compatible outputs with recursively sorted object keys; arrays remain ordered. The opaque-origin frame hosts a dedicated Worker, blocks network connections using CSP, bounds serialized output, and is removed after completion or timeout. It is designed for local practice, not adversarial execution.

The learning plan uses the selected role and the newest report saved for that role. It links to resume review, a role-aligned coding problem, an interview focus, and consultation preparation. Candidate activity can change the coding recommendation (including prioritizing an attempted problem with weaker recorded accuracy) and interview focus (based on low self-ratings). Each item explains its source, links to its module, and stores completion separately. Changing roles recalculates the plan; completion keys remain associated with their original role/item identifiers.

Demonstration mode is opt-in and never replaces or writes to the real `AppData` record. Its synthetic resume analysis is the only preloaded achievement; coding attempts and interview activity must be performed by the user and remain in the in-memory demo record. Reset/exit discards that record. Demo code drafts use a `sessionStorage` prefix distinct from ordinary local drafts.

Interview evaluation is a candidate self-rating against per-question reflection criteria. No algorithm claims to judge response quality. Kilo uses fixed, non-generative guidance with the browser SpeechSynthesis API only after the user enables voice. It has no microphone or speech-recognition path; browser voice support varies and the text prompt is always present.

## Static hosting

Vite emits static assets. `public/_redirects` supplies a Netlify-style rewrite for client-side routes. Other static hosts should rewrite unknown paths to the SPA entry point. No runtime server is part of the architecture.