import {
  INTERVIEW_QUESTIONS,
  QUESTIONS,
  ROLES,
  type AppData,
} from "./domain";

export type LearningItem = {
  id: string;
  title: string;
  detail: string;
  reason: string;
  href: string;
  completed: boolean;
};

const INTERVIEW_FOCUS: Record<string, string> = {
  frontend: "Frontend development",
  backend: "Backend development",
  fullstack: "Frontend development",
  analyst: "Data analytics",
  scientist: "Data analytics",
  sde: "Data structures & algorithms",
  devops: "General software engineering",
};

export function buildLearningPlan(data: AppData): LearningItem[] {
  const completed = new Set(data.completedLearningItems);
  const makeItem = (
    item: Omit<LearningItem, "completed">,
  ): LearningItem => ({
    ...item,
    completed: completed.has(item.id),
  });

  const role = ROLES.find((item) => item.id === data.preferences.role);
  if (!role) {
    return [
      makeItem({
        id: "choose-target-role",
        title: "Choose a target role",
        detail: "Set a role to personalize coding and interview suggestions.",
        reason:
          "Recommendations use the role you select; no target role is currently saved.",
        href: "/settings",
      }),
    ];
  }

  const report = data.analyses.find((item) => item.roleId === role.id);
  const gaps = report?.missing ?? [];
  const items: LearningItem[] = [];

  if (!report) {
    items.push(
      makeItem({
        id: `${role.id}:resume`,
        title: "Compare your resume with this role",
        detail: `Create a local skill snapshot for ${role.name}.`,
        reason:
          "There is no saved analysis for your current target role yet, so specific gaps are unavailable.",
        href: "/resume",
      }),
    );
  } else {
    const gapList = gaps.slice(0, 3).join(", ");
    items.push(
      makeItem({
        id: `${role.id}:gaps:${report.id}`,
        title: gaps.length
          ? `Review ${gaps.length} skill gap${gaps.length === 1 ? "" : "s"}`
          : "Review your role comparison",
        detail: gaps.length
          ? `Not detected in the saved resume text: ${gapList}${gaps.length > 3 ? ", and more" : ""}.`
          : "All skills in the saved target list appeared in the resume text.",
        reason:
          "This uses keyword evidence from your latest saved resume analysis; it does not measure proficiency.",
        href: "/resume",
      }),
    );
  }

  const roleTopics: readonly string[] = role.coding;
  const candidates = QUESTIONS.filter((question) =>
    question.topics.some((topic) => roleTopics.includes(topic)),
  );
  const rankedQuestions = candidates
    .map((question) => {
      const attempts = data.attempts.filter(
        (attempt) => attempt.questionId === question.id,
      );
      const solved = attempts.some(
        (attempt) => attempt.total > 0 && attempt.passed === attempt.total,
      );
      const accuracy = attempts.length
        ? attempts.reduce(
            (sum, attempt) => sum + attempt.passed / attempt.total,
            0,
          ) / attempts.length
        : 1;
      return { question, attempts, solved, accuracy };
    })
    .sort((left, right) => {
      const progressRank = (item: (typeof rankedQuestions)[number]) =>
        item.solved ? 2 : item.attempts.length ? 0 : 1;
      return (
        progressRank(left) - progressRank(right) ||
        left.accuracy - right.accuracy ||
        roleTopics.findIndex((topic) => left.question.topics.includes(topic)) -
          roleTopics.findIndex((topic) => right.question.topics.includes(topic)) ||
        QUESTIONS.indexOf(left.question) - QUESTIONS.indexOf(right.question)
      );
    });
  const recommendedQuestion = rankedQuestions[0];
  if (recommendedQuestion) {
    const { question, attempts, solved } = recommendedQuestion;
    const leadGap = gaps[0];
    items.push(
      makeItem({
        id: `${role.id}:coding:${question.id}`,
        title: `Practise ${question.topics[0]}: ${question.title}`,
        detail: `${question.difficulty} · ${question.topics.join(" · ")}`,
        reason: attempts.length
          ? `Your recorded attempts on this problem average ${Math.round(recommendedQuestion.accuracy * 100)}% test accuracy; revisit it before moving on.`
          : leadGap
            ? `Your saved analysis flags ${leadGap}. This role-aligned problem practises ${question.topics.join(" and ")}; it is coding-pattern practice, not a test of resume proficiency.`
            : `This unattempted problem matches the coding patterns listed for ${role.name}.`,
        href: `/coding/${question.id}`,
      }),
    );
    if (solved) {
      items[items.length - 1] = {
        ...items[items.length - 1],
        reason:
          "Your recorded attempts show this problem is solved. Revisit the explanation or choose another role-aligned problem.",
      };
    }
  }

  const roleSessions = data.interviews.filter(
    (session) => session.role === role.name && session.completedAt,
  );
  const ratedSessions = roleSessions
    .map((session) => {
      const scores = session.answers
        .map((answer) => answer.selfScore)
        .filter((score): score is number => typeof score === "number");
      return {
        category: session.category,
        average: scores.length
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null,
      };
    })
    .filter(
      (session): session is { category: string; average: number } =>
        session.average !== null,
    )
    .sort((left, right) => left.average - right.average);
  const interviewFocus =
    ratedSessions[0]?.category ??
    INTERVIEW_FOCUS[role.id] ??
    INTERVIEW_QUESTIONS[0].category;
  items.push(
    makeItem({
      id: `${role.id}:interview:${interviewFocus}`,
      title: `Practise ${interviewFocus.toLowerCase()}`,
      detail: `A guided, self-reviewed interview for ${role.name}.`,
      reason: ratedSessions.length
        ? `Your recorded self-ratings are lowest for ${interviewFocus}; this is a prompt for more practice, not an external assessment.`
        : gaps.length
          ? `This role-aligned interview focus gives you a chance to explain and reflect on areas highlighted by your resume analysis.`
          : `This focus is selected from the interview topics associated with ${role.name}.`,
      href: `/interviews?role=${encodeURIComponent(role.id)}&focus=${encodeURIComponent(interviewFocus)}`,
    }),
  );

  items.push(
    makeItem({
      id: `${role.id}:consultation:${report?.id ?? "start"}`,
      title: "Prepare a consultation agenda",
      detail: "Turn your current goal and learning priorities into questions.",
      reason: gaps.length
        ? `Use your saved analysis gaps${gaps[0] ? `, including ${gaps[0]}` : ""} to make a focused agenda. Sample profiles are illustrative and no booking is made.`
        : "Industry Connect helps prepare a conversation; it does not contact or book a mentor.",
      href: "/connect",
    }),
  );

  return items;
}
