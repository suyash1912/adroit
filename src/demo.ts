import { DEFAULT_DATA, type AppData } from "./domain";

export function createDemoData(): AppData {
  return {
    ...structuredClone(DEFAULT_DATA),
    preferences: {
      ...DEFAULT_DATA.preferences,
      role: "frontend",
    },
    analyses: [
      {
        id: "synthetic-resume-example",
        createdAt: "2026-01-15T12:00:00.000Z",
        roleId: "frontend",
        roleName: "Frontend Developer",
        basis: "role-profile",
        score: 44,
        detected: ["CSS", "Git", "HTML", "JavaScript"],
        matched: ["JavaScript", "HTML", "CSS", "Git"],
        missing: [
          "TypeScript",
          "React",
          "Accessibility",
          "Testing",
          "REST APIs",
          "Performance",
          "Responsive design",
        ],
        priorities: [
          "Web accessibility",
          "Frontend testing",
          "Component design",
          "Browser fundamentals",
        ],
        textExcerpt:
          "SYNTHETIC SAMPLE ONLY: coursework in HTML, CSS, JavaScript, and Git.",
      },
    ],
  };
}
