import { DEFAULT_DATA, type AppData } from "./domain";

const KEY = "adroit.local.v1";

export function loadData(): AppData {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      !value ||
      typeof value !== "object" ||
      !("version" in value) ||
      value.version !== 1
    )
      return structuredClone(DEFAULT_DATA);
    const data = value as Partial<AppData>;
    return {
      ...DEFAULT_DATA,
      ...data,
      preferences: { ...DEFAULT_DATA.preferences, ...data.preferences },
      analyses: Array.isArray(data.analyses) ? data.analyses : [],
      attempts: Array.isArray(data.attempts) ? data.attempts : [],
      interviews: Array.isArray(data.interviews) ? data.interviews : [],
      mentorNotes: Array.isArray(data.mentorNotes) ? data.mentorNotes : [],
    };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearData(): void {
  localStorage.removeItem(KEY);
}

export function exportData(data: AppData): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `adroit-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
