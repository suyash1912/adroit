import { ROLES } from "./domain";

const SKILL_ALIASES: Record<string, string[]> = {
  JavaScript: ["javascript", "js", "ecmascript"],
  TypeScript: ["typescript", "ts"],
  "Node.js": ["node.js", "nodejs", "node"],
  React: ["react", "react.js", "reactjs"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3"],
  "REST APIs": ["rest api", "rest apis", "restful api", "restful apis"],
  SQL: ["sql", "mysql", "postgresql", "postgres"],
  Python: ["python"],
  Java: ["java"],
  C: ["c language", "c programming"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "c sharp"],
  Git: ["git", "github", "gitlab"],
  "Data structures": ["data structures", "data structure"],
  Algorithms: ["algorithms", "algorithm"],
  "Machine learning": ["machine learning", "ml", "scikit-learn"],
  "Data visualization": ["data visualization", "tableau", "power bi"],
  Statistics: ["statistics", "statistical"],
  Excel: ["excel", "spreadsheets"],
  Docker: ["docker", "containers"],
  Kubernetes: ["kubernetes", "k8s"],
  "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
  Cloud: ["cloud computing", "aws", "azure", "google cloud"],
  Linux: ["linux"],
  Terraform: ["terraform"],
  Redis: ["redis"],
  Authentication: ["authentication", "oauth"],
  Testing: ["testing", "unit tests", "test automation", "vitest", "jest"],
  Performance: ["performance optimization", "web performance"],
  "Responsive design": ["responsive design", "mobile-first"],
  Accessibility: ["accessibility", "wcag", "aria"],
  "System design": ["system design", "distributed systems"],
  Concurrency: ["concurrency", "multithreading", "parallelism"],
  Networking: ["networking", "tcp/ip", "dns"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  "Scikit-learn": ["scikit-learn", "sklearn"],
  "A/B testing": ["a/b testing", "ab testing", "experimentation"],
  "Power BI": ["power bi"],
  Tableau: ["tableau"],
  "Object-oriented design": ["object-oriented", "oop"],
  Monitoring: ["monitoring", "observability", "prometheus", "grafana"],
  "Database indexing": ["database indexing", "indexes", "indexing"],
  "Data cleaning": ["data cleaning", "data wrangling"],
};

function includesTerm(text: string, term: string): boolean {
  const escaped = term
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  const short = term.length < 3;
  const boundary = short
    ? `(?:^|[^a-z0-9+#])${escaped}(?:$|[^a-z0-9+#])`
    : `(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`;
  return new RegExp(boundary, "i").test(text);
}

export function extractSkills(text: string): string[] {
  const found = new Set<string>();
  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((alias) => includesTerm(text, alias))) found.add(skill);
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

export function matchRole(
  text: string,
  roleId: string,
  jobDescription = "",
) {
  const role = ROLES.find((item) => item.id === roleId) ?? ROLES[0];
  const detected = extractSkills(text);
  const required = [...role.core, ...role.secondary];
  const hasJobDescription = jobDescription.trim().length > 0;
  const jobSkills = extractSkills(jobDescription);
  const targetSkills = hasJobDescription ? jobSkills : required;
  const skillWeight = (skill: string) =>
    role.core.includes(skill as never) ? 2 : 1;
  const matched = targetSkills.filter((skill) => detected.includes(skill));
  const missing = targetSkills.filter((skill) => !detected.includes(skill));
  const score =
    targetSkills.length === 0
      ? 0
      : Math.round(
          (matched.reduce((sum, skill) => sum + skillWeight(skill), 0) /
            targetSkills.reduce((sum, skill) => sum + skillWeight(skill), 0)) *
            100,
        );
  return {
    role,
    detected,
    targetSkills,
    basis: hasJobDescription ? ("job-description" as const) : ("role-profile" as const),
    matched,
    missing,
    score,
    priorities: role.topics
      .filter((topic) =>
        missing.some((skill) =>
          new RegExp(skill.split(" ")[0], "i").test(topic),
        ),
      )
      .concat(role.topics)
      .filter((topic, index, all) => all.indexOf(topic) === index)
      .slice(0, 4),
  };
}

export function extractPdfText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(
        new Error(
          "The PDF could not be read. Try pasting your resume text instead.",
        ),
      );
    reader.onload = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const pdf = await pdfjs.getDocument({
          data: new Uint8Array(reader.result as ArrayBuffer),
        }).promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" "),
          );
        }
        resolve(pages.join("\n").trim());
      } catch {
        reject(
          new Error(
            "This PDF could not be parsed. Try a text-based PDF or paste your resume text.",
          ),
        );
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
