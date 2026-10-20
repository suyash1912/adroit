# Adroit Test Plan

## Automated checks

Run from the repository root:

```sh
npm test
npm run build
```

Vitest covers skill alias and matching boundaries, role weighting, local-data migration and validation, learning-plan recommendation inputs, the curated question catalog and reference solutions, key route behavior, resume-save consent, interview creation, mentor filters, and speech-coach fallback/opt-in. The build runs the strict TypeScript project check before Vite bundles the application.

## Browser smoke tests

Use a current desktop Chromium-based browser and a narrow/mobile viewport. Repeat key navigation and forms with keyboard-only input and check visible focus, accessible names, and reduced-motion settings.

### Appearance themes

- Switch among Midnight Ranger, Choco-Choco, and Crimson Pop from the sidebar; verify the selected name, preview, page surfaces, navigation, cards, forms, tables, and coding workspace remain legible across routes.
- Repeat theme changes from Settings and confirm both controls stay synchronized after refresh.
- Use keyboard-only navigation and a mobile viewport to reach and operate the theme picker. Confirm focus visibility and that reduced-motion settings suppress the visual transitions.
- Load legacy version-one/two records and verify migration preserves user records while mapping old light to Crimson Pop and old dark/system to Midnight Ranger.

### Learning journey

1. Start with empty browser storage. Confirm the dashboard shows honest zero/empty states and the plan asks for a target role.
2. Select a role in the plan. Confirm it offers resume analysis, role-aligned coding, an interview focus, and consultation preparation, each with a reason and working module link.
3. Analyze editable resume text and save the report. Confirm the plan uses missing skills from that role-matched report.
4. Submit a coding attempt. Confirm the recorded result changes which coding problem is recommended when applicable.
5. Complete and self-rate an interview. Confirm the focus can change based on the lowest recorded self-rating.
6. Mark and reopen plan items; refresh and confirm completion is retained. Change roles and confirm recommendations recalculate without transferring completion to a different role.

### Demonstration mode

- Enter the guided demo explicitly and confirm its synthetic report is visibly labelled.
- Run a real coding attempt and create a real mock-interview session within the demo; confirm the UI does not prefill a successful attempt or completed interview.
- Reset, then exit. Confirm demo state and demo drafts are discarded and the real saved workspace is unchanged.

### Resume analysis

- Try valid text, duplicate aliases, a misleading substring such as `Pandas` without `Python`, a short C-related token in ordinary prose, an empty job description, and a description with no recognized skills.
- Try a valid text PDF, an empty PDF, a malformed PDF, an oversized file, and a scanned/image-only PDF. Confirm errors distinguish parse failure from the lack of OCR.
- Edit extracted text, compare to both a role and a job description, and compare the displayed report with its exported copy.
- Confirm no report is stored until the save action; confirm deletion removes the selected report.

### Coding practice

- Check search, difficulty/topic/completion filters, ordering, problem statements, starter-code reset, draft persistence, hints, reference solutions, and the elapsed timer.
- Run passing, failing, syntax-error, thrown-error, and deliberately long-running submissions. Confirm visible results/errors, timeout cleanup, and no stale result after editing.
- Inspect the frame sandbox, CSP, worker communication, result validation, output bounds, and timeout behavior in supported browsers. Treat the runner as a practice convenience, not a security boundary; do not run sensitive or hostile code.

### Interviews and consultation preparation

- Start sessions with multiple question counts/focuses; navigate both directions and refresh to confirm answers persist.
- Finish early and at the final question, review self-ratings, and verify completion/history behavior.
- Test with speech synthesis absent, disabled, and enabled; confirm no microphone prompt or speech-recognition claim.
- Filter the illustrative directory to no matches. Save, edit, reorder, copy, export, and delete an agenda; confirm no booking or contact action is implied.

### Persistence, exports, and error recovery

- Reload after saving reports, attempts, interview drafts, notes, preferences, and plan completion.
- Verify version-one/two data migrates; malformed/unsupported data yields a visible warning and a recovery copy. Confirm invalid nested records are not passed into route components.
- Test blocked/quota-exceeded local storage and confirm the UI does not report a successful save.
- Export JSON and CSV, inspect field completeness and CSV quoting, then clear local data and verify records, recovery copies, and coding drafts are gone.

## Scope of verification

The automated suite runs in jsdom and does not exercise real PDF workers, browser storage quotas, speech engines, or iframe/Worker security behavior. Browser smoke tests are manual; results should be recorded separately for each browser/version rather than inferred from the unit suite.
