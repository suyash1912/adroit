import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_DATA, INTERVIEW_QUESTIONS, QUESTIONS, ROLES } from "./domain";
import { buildLearningPlan } from "./learning";
import { createDemoData } from "./demo";
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
      "Built a React.js app with JS and JavaScript, NodeJS, and CSS. A DOM node was updated.",
    );
    expect(skills).toContain("React");
    expect(skills).toContain("JavaScript");
    expect(skills).toContain("Node.js");
    expect(skills).toContain("CSS");
    expect(skills).not.toContain("C");
    expect(extractSkills("A DOM node was updated.")).not.toContain("Node.js");
    expect(skills.filter((skill) => skill === "JavaScript")).toHaveLength(1);
    expect(extractSkills("")).toEqual([]);
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

  it("uses the role profile when the optional job description is empty and exposes evidence", () => {
    const result = matchRole(
      "I built a responsive JavaScript and React application.",
      "frontend",
      "  ",
    );
    expect(result.basis).toBe("role-profile");
    expect(result.matched).toContain("JavaScript");
    expect(result.evidence.JavaScript).toContain("JavaScript");
    expect(result.evidence.React).toContain("React");
  });
});

describe("local records and curated data", () => {
  it("seeds only the labelled synthetic resume example in demo data", () => {
    const demo = createDemoData();
    expect(demo.preferences.role).toBe("frontend");
    expect(demo.analyses[0].textExcerpt).toMatch(/synthetic sample only/i);
    expect(demo.attempts).toEqual([]);
    expect(demo.interviews).toEqual([]);
    expect(demo.mentorNotes).toEqual([]);
  });

  it("loads defaults for malformed or outdated browser data", () => {
    localStorage.setItem("adroit.local.v1", "{broken");
    expect(loadData().data).toEqual(DEFAULT_DATA);
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ version: 99, analyses: [] }),
    );
    expect(loadData().data).toEqual(DEFAULT_DATA);
    expect(
      Object.keys(localStorage).some((key) =>
        key.startsWith("adroit.local.recovery."),
      ),
    ).toBe(true);
  });

  it("defaults to Midnight Ranger and migrates legacy themes without dropping records", () => {
    const attempt = {
      id: "attempt-1",
      questionId: "two-sum",
      passed: 2,
      total: 2,
      createdAt: "2026-01-01T00:00:00.000Z",
      durationSeconds: 45,
    };
    const previousData = {
      ...DEFAULT_DATA,
      version: 2,
      preferences: { ...DEFAULT_DATA.preferences, theme: "dark" },
      attempts: [attempt],
      completedLearningItems: ["frontend:resume"],
    };
    localStorage.setItem("adroit.local.v1", JSON.stringify(previousData));
    const result = loadData();
    expect(DEFAULT_DATA.preferences.theme).toBe("midnight-ranger");
    expect(result.data.version).toBe(3);
    expect(result.data.preferences.theme).toBe("midnight-ranger");
    expect(result.data.attempts).toEqual([attempt]);
    expect(result.data.completedLearningItems).toEqual(["frontend:resume"]);
    expect(result.warning).toMatch(/upgraded/i);
  });

  it("maps the former light theme to Crimson Pop during migration", () => {
    const previousData = {
      ...DEFAULT_DATA,
      version: 2,
      preferences: { ...DEFAULT_DATA.preferences, theme: "light" },
    };
    localStorage.setItem("adroit.local.v1", JSON.stringify(previousData));
    expect(loadData().data.preferences.theme).toBe("crimson-pop");
  });

  it("maps the former system theme to Midnight Ranger during migration", () => {
    const previousData = {
      ...DEFAULT_DATA,
      version: 2,
      preferences: { ...DEFAULT_DATA.preferences, theme: "system" },
    };
    localStorage.setItem("adroit.local.v1", JSON.stringify(previousData));
    expect(loadData().data.preferences.theme).toBe("midnight-ranger");
  });

  it("saves and clears records locally", () => {
    const data = {
      ...DEFAULT_DATA,
      preferences: { ...DEFAULT_DATA.preferences, role: "frontend" },
    };
    expect(saveData(data)).toBe(true);
    expect(loadData().data.preferences.role).toBe("frontend");
    clearData();
    expect(loadData().data).toEqual(DEFAULT_DATA);
  });

  it("migrates valid version-one records and initializes plan progress", () => {
    const { completedLearningItems: _ignored, ...versionOne } = DEFAULT_DATA;
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ ...versionOne, version: 1 }),
    );
    const result = loadData();
    expect(result.data.version).toBe(3);
    expect(result.data.completedLearningItems).toEqual([]);
    expect(result.warning).toMatch(/upgraded/i);
  });

  describe("appearance themes", () => {
    it("exposes all three themes and saves the sidebar selection", () => {
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
      );
      fireEvent.click(screen.getByRole("button", { name: /midnight ranger/i }));
      fireEvent.click(screen.getByRole("button", { name: /crimson pop/i }));
      expect(document.documentElement.dataset.theme).toBe("crimson-pop");
      expect(
        JSON.parse(localStorage.getItem("adroit.local.v1") ?? "{}").preferences
          .theme,
      ).toBe("crimson-pop");
      fireEvent.click(screen.getByRole("button", { name: /crimson pop/i }));
      expect(screen.getByRole("button", { name: /choco-choco/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /midnight ranger/i })).toBeTruthy();
    });
  });

  it("rejects malformed nested records instead of exposing them to the app", () => {
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({ ...DEFAULT_DATA, attempts: [{ passed: "all" }] }),
    );
    const result = loadData();
    expect(result.data.attempts).toEqual([]);
    expect(result.warning).toMatch(/recovery copy/i);
  });

  it("builds role-specific plan steps and ranks coding practice from real attempts", () => {
    const role = ROLES.find((item) => item.id === "frontend")!;
    const candidate = QUESTIONS.find((question) =>
      role.coding.some((topic) => question.topics.includes(topic)),
    )!;
    const data = {
      ...DEFAULT_DATA,
      preferences: { ...DEFAULT_DATA.preferences, role: role.id },
      attempts: [
        {
          id: "attempt-1",
          questionId: candidate.id,
          passed: 0,
          total: 3,
          createdAt: "2026-01-01T00:00:00.000Z",
          durationSeconds: 20,
        },
      ],
    };
    const plan = buildLearningPlan(data);
    expect(plan[0].title).toMatch(/compare your resume/i);
    expect(plan.some((item) => item.href.startsWith("/coding/"))).toBe(true);
    expect(
      plan.find((item) => item.href.startsWith("/coding/"))?.reason,
    ).toMatch(/recorded attempts/i);
    expect(plan.some((item) => item.href.startsWith("/interviews?"))).toBe(
      true,
    );
    expect(plan.some((item) => item.href === "/connect")).toBe(true);
  });

  it("uses saved self-ratings and per-role completion state in plan recommendations", () => {
    const role = ROLES.find((item) => item.id === "frontend")!;
    const category = "Frontend development";
    const plan = buildLearningPlan({
      ...DEFAULT_DATA,
      preferences: { ...DEFAULT_DATA.preferences, role: role.id },
      interviews: [
        {
          id: "interview-1",
          createdAt: "2026-01-01T00:00:00.000Z",
          completedAt: "2026-01-01T00:10:00.000Z",
          role: role.name,
          category,
          difficulty: "Intermediate",
          durationMinutes: 20,
          answers: [
            {
              questionId: "frontend-1",
              answer: "A considered answer",
              selfScore: 1,
            },
          ],
          questionIds: ["frontend-1"],
        },
      ],
      completedLearningItems: [`${role.id}:interview:${category}`],
    });
    const interviewStep = plan.find((item) =>
      item.href.startsWith("/interviews?"),
    );
    expect(interviewStep?.reason).toMatch(/lowest/i);
    expect(interviewStep?.completed).toBe(true);
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
    expect(loadData().data.analyses).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /save locally/i }));
    fireEvent.click(screen.getByRole("button", { name: /save locally/i }));
    expect(loadData().data.analyses).toHaveLength(1);
    expect(loadData().data.analyses[0].matched).toContain("React");
  });

  it("carries a saved resume analysis into a navigable role-aware learning plan", () => {
    render(
      <MemoryRouter initialEntries={["/learning-plan"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Target role"), {
      target: { value: "frontend" },
    });
    fireEvent.click(
      screen.getAllByRole("link", { name: /open relevant module/i })[0],
    );
    fireEvent.change(screen.getByLabelText("Resume text"), {
      target: {
        value:
          "Built a React and JavaScript project with HTML, CSS, and Git experience.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyse skills/i }));
    fireEvent.click(screen.getByRole("button", { name: /save locally/i }));
    fireEvent.click(
      within(screen.getByRole("navigation")).getByRole("link", {
        name: /learning plan/i,
      }),
    );
    expect(
      screen.getByRole("heading", { name: /review .* skill gap/i }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: /mark complete/i })[0],
    );
    expect(
      loadData().data.completedLearningItems.length,
    ).toBeGreaterThan(0);
    const codingLink = screen
      .getAllByRole("link", { name: /open relevant module/i })
      .find((link) => link.getAttribute("href")?.startsWith("/coding/"));
    expect(codingLink).toBeDefined();
    fireEvent.click(codingLink!);
    expect(
      screen.getByRole("heading", { name: /pair sum/i }),
    ).toBeInTheDocument();
  });

  it("keeps synthetic demonstration activity separate from the real workspace", () => {
    const realData = {
      ...DEFAULT_DATA,
      preferences: { ...DEFAULT_DATA.preferences, role: "backend" },
    };
    expect(saveData(realData)).toBe(true);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /explore guided demo/i }),
    );
    expect(
      screen.getByRole("region", { name: "Demonstration mode" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/synthetic resume data only/i)).toBeInTheDocument();
    expect(loadData().data.preferences.role).toBe("backend");
    expect(loadData().data.analyses).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /exit demo/i }));
    expect(
      screen.queryByRole("region", { name: "Demonstration mode" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/toward Backend Developer/i)).toBeInTheDocument();
    expect(loadData().data.preferences.role).toBe("backend");
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
    fireEvent.click(screen.getByRole("button", { name: /pause interview timer/i }));
    expect(
      screen.getByRole("button", { name: /resume interview timer/i }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reset interview timer/i }));
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(loadData().data.interviews).toHaveLength(1);
    expect(loadData().data.interviews[0].questionIds).toHaveLength(5);
  });

  it("opens the role and interview focus chosen by a learning-plan recommendation", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/interviews?role=frontend&focus=Frontend%20development",
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Target role")).toHaveValue("frontend");
    expect(screen.getByLabelText("Interview focus")).toHaveValue(
      "Frontend development",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /start a practice session/i }),
    );
    expect(
      screen.getByRole("heading", {
        name: /keep a user interface responsive/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows accuracy over time only when multiple real attempts exist", () => {
    const data = {
      ...DEFAULT_DATA,
      attempts: [
        {
          id: "attempt-first",
          questionId: QUESTIONS[0].id,
          passed: 1,
          total: 3,
          createdAt: "2026-01-01T12:00:00.000Z",
          durationSeconds: 15,
        },
        {
          id: "attempt-second",
          questionId: QUESTIONS[0].id,
          passed: 3,
          total: 3,
          createdAt: "2026-01-02T12:00:00.000Z",
          durationSeconds: 30,
        },
      ],
    };
    localStorage.setItem("adroit.local.v1", JSON.stringify(data));
    render(
      <MemoryRouter initialEntries={["/progress"]}>
        <App />
      </MemoryRouter>,
    );
    const trend = screen.getByRole("list", {
      name: "Test accuracy by coding attempt",
    });
    expect(within(trend).getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByText(/single attempt is not enough/i),
    ).not.toBeInTheDocument();
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

  it("generates editable consultation questions, reorders agenda items, and shows no-match state", () => {
    localStorage.setItem(
      "adroit.local.v1",
      JSON.stringify({
        ...DEFAULT_DATA,
        preferences: { ...DEFAULT_DATA.preferences, role: "frontend" },
        analyses: [
          {
            id: "report-1",
            createdAt: "2026-01-01T00:00:00.000Z",
            roleId: "frontend",
            roleName: "Frontend Developer",
            basis: "role-profile",
            score: 20,
            detected: ["React"],
            matched: ["React"],
            missing: ["Accessibility"],
            priorities: [],
            textExcerpt: "Resume evidence",
          },
        ],
      }),
    );
    render(
      <MemoryRouter initialEntries={["/connect"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Career goal"), {
      target: { value: "Build an accessible portfolio" },
    });
    expect(
      screen.getByText(/build and demonstrate accessibility .* accessible portfolio/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add suggestions/i }));
    expect(
      (screen.getByLabelText("Questions to bring") as HTMLTextAreaElement)
        .value,
    ).toContain("Accessibility");
    fireEvent.change(screen.getByLabelText("Personal agenda"), {
      target: { value: "Review portfolio\nDiscuss next steps" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Move agenda item 2 up" }),
    );
    expect(screen.getByLabelText("Personal agenda")).toHaveValue(
      "Discuss next steps\nReview portfolio",
    );
    fireEvent.change(screen.getByPlaceholderText("Search by name, role, expertise"), {
      target: { value: "no matching profile" },
    });
    expect(screen.getByText(/no sample profiles match/i)).toBeInTheDocument();
  });
});
