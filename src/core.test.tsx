import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_DATA, INTERVIEW_QUESTIONS, QUESTIONS, ROLES } from "./domain";
import { extractSkills, matchRole } from "./resume";
import { clearData, loadData, saveData } from "./storage";
import App from "./App";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("resume skill matching", () => {
  it("normalizes common aliases and does not match a lone C inside words", () => {
    const skills = extractSkills(
      "Built a React.js app with JS, NodeJS, and CSS. I can communicate clearly.",
    );
    expect(skills).toContain("React");
    expect(skills).toContain("JavaScript");
    expect(skills).toContain("Node.js");
    expect(skills).toContain("CSS");
    expect(skills).not.toContain("C");
  });

  it("matches the documented weighted role score", () => {
    const role = ROLES.find((item) => item.id === "frontend")!;
    const oneCore = role.core[0];
    const result = matchRole(`${oneCore}`, role.id);
    expect(result.matched).toEqual([oneCore]);
    expect(result.score).toBe(
      Math.round((2 / (role.core.length * 2 + role.secondary.length)) * 100),
    );
  });

  it("compares resume skills to job-description skills without treating the job as resume evidence", () => {
    const result = matchRole(
      "I built accessible interfaces with React and JavaScript.",
      "frontend",
      "Seeking a developer with React, JavaScript, and Kubernetes experience.",
    );
    expect(result.basis).toBe("job-description");
    expect(result.detected).not.toContain("Kubernetes");
    expect(result.matched).toEqual(["JavaScript", "React"]);
    expect(result.missing).toEqual(["Kubernetes"]);
    expect(result.score).toBe(80);
  });

  it("does not treat Pandas as proof of Python experience", () => {
    const skills = extractSkills("Used Pandas to clean survey data.");
    expect(skills).toContain("Pandas");
    expect(skills).not.toContain("Python");
  });

  it("does not substitute role skills when a job description has no recognized skills", () => {
    const result = matchRole(
      "A candidate with collaborative energy and a thoughtful approach.",
      "frontend",
      "We are looking for a curious teammate who enjoys solving problems.",
    );
    expect(result.basis).toBe("job-description");
    expect(result.targetSkills).toEqual([]);
    expect(result.score).toBe(0);
  });
});

describe("local records and curated data", () => {
  it("loads defaults for malformed or outdated browser data", () => {
    localStorage.setItem("adroit.local.v1", "{broken");
    expect(loadData()).toEqual(DEFAULT_DATA);
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ version: 99, analyses: [] }),
    );
    expect(loadData()).toEqual(DEFAULT_DATA);
  });

  it("saves and clears records locally", () => {
    const data = {
      ...DEFAULT_DATA,
      preferences: { ...DEFAULT_DATA.preferences, role: "frontend" },
    };
    expect(saveData(data)).toBe(true);
    expect(loadData().preferences.role).toBe("frontend");
    clearData();
    expect(loadData()).toEqual(DEFAULT_DATA);
  });

  it("contains at least 40 unique runnable questions with three tests and prep tracks", () => {
    expect(QUESTIONS).toHaveLength(46);
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(
      QUESTIONS.length,
    );
    expect(
      QUESTIONS.every(
        (question) =>
          question.tests.length >= 3 &&
          question.solution.includes("function solve") &&
          question.companyTracks.length > 0,
      ),
    ).toBe(true);
  });

  it("keeps every reference solution consistent with its test cases", () => {
    for (const question of QUESTIONS) {
      const solve = new Function(`${question.solution}; return solve`)() as (
        input: unknown,
      ) => unknown;
      for (const test of question.tests) {
        const normalized = JSON.parse(
          JSON.stringify(solve(test.input)),
        ) as unknown;
        expect(
          normalized,
          `${question.title} input ${JSON.stringify(test.input)}`,
        ).toEqual(test.expected);
      }
    }
  });
});

describe("application navigation", () => {
  it("renders the local dashboard and its honest empty state", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no report saved/i)).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation")).getByRole("link", {
        name: /resume analysis/i,
      }),
    ).toHaveAttribute("href", "/resume");
  });

  it("renders the coding library route", () => {
    render(
      <MemoryRouter initialEntries={["/coding"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /practice with purpose/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/24/)).toBeInTheDocument();
  });

  it("analyses and saves resume text only after explicit consent", () => {
    render(
      <MemoryRouter initialEntries={["/resume"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Resume text"), {
      target: {
        value:
          "Built a React project using JavaScript, TypeScript, HTML, CSS and Git.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyse skills/i }));
    expect(screen.getByText(/resume text overlap/i)).toBeInTheDocument();
    expect(loadData().analyses).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /save locally/i }));
    expect(loadData().analyses).toHaveLength(1);
    expect(loadData().analyses[0].matched).toContain("React");
  });

  it("filters coding problems by difficulty", () => {
    render(
      <MemoryRouter initialEntries={["/coding"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Difficulty" }), {
      target: { value: "Hard" },
    });
    expect(screen.getByText("Shortest Grid Steps")).toBeInTheDocument();
    expect(screen.queryByText("Pair Sum")).not.toBeInTheDocument();
  });

  it("filters coding problems by company-oriented preparation track", () => {
    render(
      <MemoryRouter initialEntries={["/coding"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Company preparation track" }),
      { target: { value: "Google" } },
    );
    expect(screen.getByText("Pair Sum")).toBeInTheDocument();
    expect(screen.queryByText("Simplify Path")).not.toBeInTheDocument();
  });

  it("sorts the coding library by title", () => {
    render(
      <MemoryRouter initialEntries={["/coding"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Sort problems" }), {
      target: { value: "Title A–Z" },
    });
    const firstProblem = screen.getAllByRole("row")[1];
    expect(within(firstProblem).getByText("Anagram Check")).toBeInTheDocument();
  });

  it("creates a guided interview session from the selected category", () => {
    render(
      <MemoryRouter initialEntries={["/interviews"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /start a practice session/i }),
    );
    expect(
      screen.getByRole("heading", { name: /take a breath/i }),
    ).toBeInTheDocument();
    expect(loadData().interviews).toHaveLength(1);
    expect(loadData().interviews[0].questionIds).toHaveLength(5);
  });

  it("shows written Kilo guidance when browser speech output is unavailable", () => {
    const session = {
      id: "voice-fallback",
      createdAt: new Date().toISOString(),
      role: "Frontend Developer",
      category: INTERVIEW_QUESTIONS[0].category,
      difficulty: "Intermediate",
      durationMinutes: 20,
      answers: [],
      questionIds: [INTERVIEW_QUESTIONS[0].id],
    };
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ ...DEFAULT_DATA, interviews: [session] }),
    );
    render(
      <MemoryRouter initialEntries={["/interviews/session/voice-fallback"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Kilo")).toBeInTheDocument();
    expect(screen.getByText(/take two slow breaths/i)).toBeInTheDocument();
    expect(
      screen.getByText(/voice output isn’t supported here/i),
    ).toBeInTheDocument();
  });

  it("speaks only after enabling Kilo and stops when muted", () => {
    class MockUtterance {
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }
    const speech = { cancel: vi.fn(), speak: vi.fn() };
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    vi.stubGlobal("speechSynthesis", speech);
    const session = {
      id: "voice-enabled",
      createdAt: new Date().toISOString(),
      role: "Frontend Developer",
      category: INTERVIEW_QUESTIONS[0].category,
      difficulty: "Intermediate",
      durationMinutes: 20,
      answers: [],
      questionIds: [INTERVIEW_QUESTIONS[0].id],
    };
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ ...DEFAULT_DATA, interviews: [session] }),
    );
    render(
      <MemoryRouter initialEntries={["/interviews/session/voice-enabled"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /enable kilo voice/i }));
    expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(speech.speak.mock.calls[0][0].text).toContain("Hi, I'm Kilo");
    fireEvent.click(screen.getByRole("button", { name: /hear question/i }));
    expect(speech.speak).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: /mute kilo/i }));
    expect(speech.cancel).toHaveBeenCalled();
  });

  it("filters the sample mentor directory by career stage", () => {
    render(
      <MemoryRouter initialEntries={["/connect"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("SAMPLE PROFILE")).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter by career stage" }),
      { target: { value: "Early career" } },
    );
    expect(
      screen.getByRole("button", { name: /Taylor Kim/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Jordan Lee/ }),
    ).not.toBeInTheDocument();
  });
});
