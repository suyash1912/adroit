import { DEFAULT_DATA, type AppData } from "./domain";

const KEY = "adroit.local.v1";
const RECOVERY_PREFIX = "adroit.local.recovery.";

type LoadResult = {
  data: AppData;
  warning?: string;
};

type VersionOneData = Omit<
  AppData,
  "version" | "completedLearningItems"
> & { version: 1 };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string";

const isDateString = (value: unknown): value is string =>
  isString(value) && Number.isFinite(Date.parse(value));

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

function isPreferences(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.role) &&
    isString(value.language) &&
    typeof value.interviewDuration === "number" &&
    Number.isFinite(value.interviewDuration) &&
    (value.theme === "light" ||
      value.theme === "dark" ||
      value.theme === "system")
  );
}

function isAnalysis(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isDateString(value.createdAt) &&
    isString(value.roleId) &&
    isString(value.roleName) &&
    (value.basis === "role-profile" || value.basis === "job-description") &&
    typeof value.score === "number" &&
    Number.isFinite(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    isStringArray(value.detected) &&
    isStringArray(value.matched) &&
    isStringArray(value.missing) &&
    isStringArray(value.priorities) &&
    isString(value.textExcerpt)
  );
}

function isAttempt(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.questionId) &&
    Number.isInteger(value.passed) &&
    Number.isInteger(value.total) &&
    Number(value.passed) >= 0 &&
    Number(value.total) > 0 &&
    Number(value.passed) <= Number(value.total) &&
    isDateString(value.createdAt) &&
    typeof value.durationSeconds === "number" &&
    Number.isFinite(value.durationSeconds) &&
    value.durationSeconds >= 0
  );
}

function isInterview(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.answers)) return false;
  const answersValid = value.answers.every(
    (answer) =>
      isRecord(answer) &&
      isString(answer.questionId) &&
      isString(answer.answer) &&
      (answer.selfScore === undefined ||
        (Number.isInteger(answer.selfScore) &&
          Number(answer.selfScore) >= 1 &&
          Number(answer.selfScore) <= 4)),
  );
  return (
    isString(value.id) &&
    isDateString(value.createdAt) &&
    (value.completedAt === undefined || isDateString(value.completedAt)) &&
    isString(value.role) &&
    isString(value.category) &&
    isString(value.difficulty) &&
    typeof value.durationMinutes === "number" &&
    Number.isFinite(value.durationMinutes) &&
    isStringArray(value.questionIds) &&
    answersValid
  );
}

function isMentorNote(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.mentorId) &&
    isString(value.goal) &&
    isStringArray(value.topics) &&
    isString(value.questions) &&
    isString(value.agenda) &&
    isDateString(value.updatedAt)
  );
}

function isAppData(value: unknown): value is AppData {
  return (
    isRecord(value) &&
    value.version === 2 &&
    isPreferences(value.preferences) &&
    Array.isArray(value.analyses) &&
    value.analyses.every(isAnalysis) &&
    Array.isArray(value.attempts) &&
    value.attempts.every(isAttempt) &&
    Array.isArray(value.interviews) &&
    value.interviews.every(isInterview) &&
    Array.isArray(value.mentorNotes) &&
    value.mentorNotes.every(isMentorNote) &&
    isStringArray(value.completedLearningItems)
  );
}

function isVersionOneData(value: unknown): value is VersionOneData {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isPreferences(value.preferences) &&
    Array.isArray(value.analyses) &&
    value.analyses.every(isAnalysis) &&
    Array.isArray(value.attempts) &&
    value.attempts.every(isAttempt) &&
    Array.isArray(value.interviews) &&
    value.interviews.every(isInterview) &&
    Array.isArray(value.mentorNotes) &&
    value.mentorNotes.every(isMentorNote)
  );
}

function preserveForRecovery(raw: string): void {
  try {
    const recoveryKey = `${RECOVERY_PREFIX}${new Date().toISOString()}`;
    localStorage.setItem(recoveryKey, raw);
  } catch {
    // Recovery is best effort when storage is unavailable or full.
  }
}

export function loadData(): LoadResult {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return { data: structuredClone(DEFAULT_DATA) };
    const value: unknown = JSON.parse(raw);

    if (isAppData(value)) return { data: value };

    if (isVersionOneData(value)) {
      return {
        data: {
          ...value,
          version: 2,
          completedLearningItems: [],
        },
        warning: "Your saved data was safely upgraded to the latest format.",
      };
    }

    preserveForRecovery(raw);
    return {
      data: structuredClone(DEFAULT_DATA),
      warning:
        "Saved data could not be validated. A recovery copy was kept in this browser; the app started with an empty workspace.",
    };
  } catch {
    return {
      data: structuredClone(DEFAULT_DATA),
      warning:
        "Browser storage could not be read. Changes may not persist in this session.",
    };
  }
}

export function saveData(data: AppData): boolean {
  if (!isAppData(data)) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearData(): void {
  try {
    localStorage.removeItem(KEY);
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(RECOVERY_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    throw new Error("Browser storage could not be cleared.");
  }
}

export function recoveryCopyCount(): number {
  try {
    return Object.keys(localStorage).filter((key) =>
      key.startsWith(RECOVERY_PREFIX),
    ).length;
  } catch {
    return 0;
  }
}

export function exportRecoveryCopies(): boolean {
  try {
    const copies = Object.keys(localStorage)
      .filter((key) => key.startsWith(RECOVERY_PREFIX))
      .map((key) => ({ key, rawData: localStorage.getItem(key) }));
    if (!copies.length) return false;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(copies, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `adroit-recovery-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch {
    return false;
  }
}

export function exportData(data: AppData): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `adroit-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
