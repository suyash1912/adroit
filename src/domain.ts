export type Difficulty = "Easy" | "Medium" | "Hard";

export type TestCase = { input: unknown; expected: unknown };

export type CodingQuestion = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string[];
  tests: TestCase[];
  starter: string;
  solution: string;
  hints: [string, string];
  complexity: string;
  track: string;
  companyTracks: string[];
};

export type ResumeAnalysis = {
  id: string;
  createdAt: string;
  roleId: string;
  roleName: string;
  basis: "role-profile" | "job-description";
  score: number;
  detected: string[];
  matched: string[];
  missing: string[];
  priorities: string[];
  textExcerpt: string;
};

export type CodingAttempt = {
  id: string;
  questionId: string;
  passed: number;
  total: number;
  createdAt: string;
  durationSeconds: number;
};

export type InterviewAnswer = {
  questionId: string;
  answer: string;
  selfScore?: number;
};

export type InterviewSession = {
  id: string;
  createdAt: string;
  completedAt?: string;
  role: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  answers: InterviewAnswer[];
  questionIds: string[];
};

export type MentorNote = {
  id: string;
  mentorId: string;
  goal: string;
  topics: string[];
  questions: string;
  agenda: string;
  updatedAt: string;
};

export type AdroitTheme =
  | "midnight-ranger"
  | "choco-choco"
  | "crimson-pop";

export type Preferences = {
  role: string;
  language: string;
  interviewDuration: number;
  theme: AdroitTheme;
};

export type AppData = {
  version: 3;
  preferences: Preferences;
  analyses: ResumeAnalysis[];
  attempts: CodingAttempt[];
  interviews: InterviewSession[];
  mentorNotes: MentorNote[];
  completedLearningItems: string[];
};

export const DEFAULT_DATA: AppData = {
  version: 3,
  preferences: {
    role: "",
    language: "JavaScript",
    interviewDuration: 20,
    theme: "midnight-ranger",
  },
  analyses: [],
  attempts: [],
  interviews: [],
  mentorNotes: [],
  completedLearningItems: [],
};

export const THEMES: {
  id: AdroitTheme;
  name: string;
  description: string;
  swatches: [string, string, string];
}[] = [
  {
    id: "midnight-ranger",
    name: "Midnight Ranger",
    description: "Focused, technical, and atmospheric",
    swatches: ["#100c1b", "#211832", "#a88aff"],
  },
  {
    id: "choco-choco",
    name: "Choco-Choco",
    description: "Warm, tactile, and comfortable",
    swatches: ["#211712", "#3b281f", "#d59a5a"],
  },
  {
    id: "crimson-pop",
    name: "Crimson Pop",
    description: "Bright, editorial, and expressive",
    swatches: ["#fffaf7", "#f1e6e1", "#c32645"],
  },
];

export const ROLES = [
  {
    id: "frontend",
    name: "Frontend Developer",
    core: [
      "JavaScript",
      "TypeScript",
      "React",
      "HTML",
      "CSS",
      "Accessibility",
      "Git",
    ],
    secondary: ["Testing", "REST APIs", "Performance", "Responsive design"],
    topics: [
      "Component design",
      "Browser fundamentals",
      "Web accessibility",
      "Frontend testing",
    ],
    coding: ["Arrays", "Strings", "DOM patterns"],
    interviews: ["JavaScript fundamentals", "React", "Web performance"],
  },
  {
    id: "backend",
    name: "Backend Developer",
    core: ["Node.js", "SQL", "REST APIs", "Data structures", "Git"],
    secondary: [
      "Docker",
      "Redis",
      "Authentication",
      "Testing",
      "System design",
    ],
    topics: [
      "API design",
      "Database indexing",
      "Caching",
      "Service reliability",
    ],
    coding: ["Hash maps", "Trees", "Graphs"],
    interviews: ["HTTP", "Databases", "System design"],
  },
  {
    id: "fullstack",
    name: "Full-Stack Developer",
    core: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "SQL",
      "REST APIs",
      "Git",
    ],
    secondary: ["HTML", "CSS", "Docker", "Testing", "Authentication"],
    topics: ["End-to-end feature design", "API contracts", "Data modeling"],
    coding: ["Arrays", "Hash maps", "Trees"],
    interviews: ["Frontend architecture", "API design", "Databases"],
  },
  {
    id: "analyst",
    name: "Data Analyst",
    core: ["SQL", "Python", "Excel", "Data visualization", "Statistics"],
    secondary: ["Tableau", "Power BI", "Pandas", "A/B testing"],
    topics: ["Data cleaning", "Exploratory analysis", "Communicating insights"],
    coding: ["Arrays", "Sorting", "Hash maps"],
    interviews: ["SQL", "Product metrics", "Statistics"],
  },
  {
    id: "scientist",
    name: "Data Scientist",
    core: ["Python", "Statistics", "Machine learning", "Pandas", "SQL"],
    secondary: [
      "NumPy",
      "Scikit-learn",
      "Experiment design",
      "Data visualization",
    ],
    topics: ["Model evaluation", "Feature engineering", "Experiment design"],
    coding: ["Arrays", "Dynamic programming", "Statistics"],
    interviews: ["Machine learning", "Probability", "Case studies"],
  },
  {
    id: "sde",
    name: "Software Development Engineer",
    core: ["Data structures", "Algorithms", "Java", "Python", "Git"],
    secondary: ["System design", "SQL", "Testing", "Concurrency"],
    topics: [
      "Algorithm analysis",
      "Object-oriented design",
      "System design basics",
    ],
    coding: ["Arrays", "Trees", "Graphs", "Dynamic programming"],
    interviews: ["Algorithms", "Data structures", "Object-oriented design"],
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    core: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud"],
    secondary: ["Terraform", "Python", "Monitoring", "Networking", "Git"],
    topics: [
      "Infrastructure as code",
      "Observability",
      "Deployment strategies",
    ],
    coding: ["Strings", "Hash maps", "Graphs"],
    interviews: ["Linux", "Containers", "Reliability"],
  },
] as const;

type QuestionSeed = Omit<
  CodingQuestion,
  "hints" | "track" | "companyTracks"
> & {
  hints: [string, string];
};

const seedQuestions: QuestionSeed[] = [
  {
    id: "pair-sum",
    title: "Pair Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash maps"],
    statement:
      "Return the indices of two values in nums that add up to target. Assume exactly one pair exists.",
    inputDescription: "An object with nums and target.",
    outputDescription: "Two distinct indices.",
    constraints: ["2 <= nums.length <= 10,000"],
    tests: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    starter:
      "function solve({ nums, target }) {\n  // Return the matching pair of indices.\n}",
    solution:
      "function solve({ nums, target }) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) return [seen.get(complement), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}",
    hints: [
      "For each value, ask whether its complement has already appeared.",
      "Store each value and index in a Map as you scan once.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic programming"],
    statement:
      "Find the largest possible sum of a non-empty contiguous subarray.",
    inputDescription: "An array of integers.",
    outputDescription: "The maximum contiguous sum.",
    constraints: ["1 <= nums.length <= 100,000"],
    tests: [
      { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
      { input: [1], expected: 1 },
      { input: [5, 4, -1, 7, 8], expected: 23 },
    ],
    starter: "function solve(nums) {\n}",
    solution:
      "function solve(nums) {\n  let best = nums[0], current = nums[0];\n  for (const value of nums.slice(1)) { current = Math.max(value, current + value); best = Math.max(best, current); }\n  return best;\n}",
    hints: [
      "At each position, either extend the prior segment or start fresh.",
      "Track the best segment ending here and the best seen overall.",
    ],
    complexity: "O(n) time, O(1) space.",
  },
  {
    id: "unique-values",
    title: "Keep First Occurrences",
    difficulty: "Easy",
    topics: ["Arrays", "Hash maps"],
    statement:
      "Return nums with duplicate values removed while keeping first-occurrence order.",
    inputDescription: "An array of primitive values.",
    outputDescription: "A stable array of unique values.",
    constraints: ["0 <= nums.length <= 100,000"],
    tests: [
      { input: [1, 1, 2, 3, 2], expected: [1, 2, 3] },
      { input: [], expected: [] },
      { input: ["a", "b", "a"], expected: ["a", "b"] },
    ],
    starter: "function solve(nums) {\n}",
    solution: "function solve(nums) { return [...new Set(nums)]; }",
    hints: [
      "A set remembers values already seen.",
      "Build the result in input order while checking a Set.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "rotate-array",
    title: "Rotate Right",
    difficulty: "Medium",
    topics: ["Arrays", "Two pointers"],
    statement:
      "Rotate nums to the right by k positions and return the new array.",
    inputDescription: "An object with nums and k.",
    outputDescription: "A rotated array.",
    constraints: ["0 <= k <= 10^9"],
    tests: [
      { input: { nums: [1, 2, 3, 4, 5], k: 2 }, expected: [4, 5, 1, 2, 3] },
      { input: { nums: [-1, -100, 3, 99], k: 2 }, expected: [3, 99, -1, -100] },
      { input: { nums: [1], k: 12 }, expected: [1] },
    ],
    starter: "function solve({ nums, k }) {\n}",
    solution:
      "function solve({ nums, k }) { if (!nums.length) return []; const shift = k % nums.length; return [...nums.slice(-shift || nums.length), ...nums.slice(0, -shift || nums.length)]; }",
    hints: [
      "Rotations larger than the array length repeat.",
      "Split at length minus k modulo length and swap the pieces.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "valid-anagram",
    title: "Anagram Check",
    difficulty: "Easy",
    topics: ["Strings", "Hash maps"],
    statement:
      "Return true when s and t contain the same characters with the same frequencies.",
    inputDescription: "An object with strings s and t.",
    outputDescription: "A boolean.",
    constraints: ["Strings contain lowercase English letters."],
    tests: [
      { input: { s: "listen", t: "silent" }, expected: true },
      { input: { s: "rat", t: "car" }, expected: false },
      { input: { s: "", t: "" }, expected: true },
    ],
    starter: "function solve({ s, t }) {\n}",
    solution:
      "function solve({ s, t }) { if (s.length !== t.length) return false; const counts = new Map(); for (const c of s) counts.set(c, (counts.get(c) || 0) + 1); for (const c of t) { const n = counts.get(c); if (!n) return false; counts.set(c, n - 1); } return true; }",
    hints: [
      "Compare character frequencies rather than sorted strings.",
      "Increment counts from s and decrement them from t.",
    ],
    complexity: "O(n) time, O(1) space for a fixed alphabet.",
  },
  {
    id: "longest-word",
    title: "Longest Word Length",
    difficulty: "Easy",
    topics: ["Strings"],
    statement:
      "Return the length of the longest word in text. Words are separated by whitespace.",
    inputDescription: "A string.",
    outputDescription: "The longest word length, or 0 for empty text.",
    constraints: ["text.length <= 100,000"],
    tests: [
      { input: "Adroit builds useful skills", expected: 6 },
      { input: "one", expected: 3 },
      { input: "  ", expected: 0 },
    ],
    starter: "function solve(text) {\n}",
    solution:
      "function solve(text) { return text.trim() ? Math.max(...text.trim().split(/\\s+/).map(word => word.length)) : 0; }",
    hints: [
      "Normalize whitespace before splitting.",
      "Measure each word and keep the maximum.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "first-unique",
    title: "First Unique Character",
    difficulty: "Easy",
    topics: ["Strings", "Hash maps"],
    statement:
      "Return the first character that appears exactly once in text, or null if none exists.",
    inputDescription: "A string.",
    outputDescription: "A single character or null.",
    constraints: ["text.length <= 100,000"],
    tests: [
      { input: "swiss", expected: "w" },
      { input: "aabb", expected: null },
      { input: "z", expected: "z" },
    ],
    starter: "function solve(text) {\n}",
    solution:
      "function solve(text) { const count = new Map(); for (const c of text) count.set(c, (count.get(c) || 0) + 1); for (const c of text) if (count.get(c) === 1) return c; return null; }",
    hints: [
      "A first pass can count every character.",
      "A second pass finds the first count of one.",
    ],
    complexity: "O(n) time, O(k) space.",
  },
  {
    id: "merge-intervals",
    title: "Merge Overlapping Ranges",
    difficulty: "Medium",
    topics: ["Sorting", "Arrays"],
    statement:
      "Merge all overlapping inclusive intervals and return them in ascending order.",
    inputDescription: "An array of [start, end] pairs.",
    outputDescription: "A sorted array of merged pairs.",
    constraints: ["0 <= intervals.length <= 10,000"],
    tests: [
      {
        input: [
          [1, 3],
          [2, 6],
          [8, 10],
          [15, 18],
        ],
        expected: [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
      },
      {
        input: [
          [1, 4],
          [4, 5],
        ],
        expected: [[1, 5]],
      },
      { input: [], expected: [] },
    ],
    starter: "function solve(intervals) {\n}",
    solution:
      "function solve(intervals) { const sorted = [...intervals].sort((a, b) => a[0] - b[0]); const out = []; for (const range of sorted) { const last = out[out.length - 1]; if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]); else out.push([...range]); } return out; }",
    hints: [
      "Sort ranges by their starting point.",
      "Compare each start to the end of the last merged range.",
    ],
    complexity: "O(n log n) time, O(n) space.",
  },
  {
    id: "binary-search",
    title: "Binary Search Index",
    difficulty: "Easy",
    topics: ["Binary search", "Arrays"],
    statement:
      "Return the index of target in a sorted ascending array, or -1 when absent.",
    inputDescription: "An object with sorted nums and target.",
    outputDescription: "An integer index or -1.",
    constraints: ["All values are distinct."],
    tests: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
      { input: { nums: [-1, 0, 3], target: 2 }, expected: -1 },
      { input: { nums: [7], target: 7 }, expected: 0 },
    ],
    starter: "function solve({ nums, target }) {\n}",
    solution:
      "function solve({ nums, target }) { let lo = 0, hi = nums.length - 1; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); if (nums[mid] === target) return mid; if (nums[mid] < target) lo = mid + 1; else hi = mid - 1; } return -1; }",
    hints: [
      "Discard half of the remaining range after each comparison.",
      "Maintain inclusive low and high bounds.",
    ],
    complexity: "O(log n) time, O(1) space.",
  },
  {
    id: "integer-sqrt",
    title: "Integer Square Root",
    difficulty: "Easy",
    topics: ["Binary search"],
    statement: "Return the greatest integer x such that x*x <= n.",
    inputDescription: "A non-negative integer.",
    outputDescription: "The floored square root.",
    constraints: ["0 <= n <= 2^31 - 1"],
    tests: [
      { input: 8, expected: 2 },
      { input: 16, expected: 4 },
      { input: 0, expected: 0 },
    ],
    starter: "function solve(n) {\n}",
    solution:
      "function solve(n) { let lo = 0, hi = n; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); if (mid * mid <= n) lo = mid + 1; else hi = mid - 1; } return hi; }",
    hints: [
      "The answer is monotonic: if x works, smaller values work.",
      "Binary-search the last integer whose square is at most n.",
    ],
    complexity: "O(log n) time, O(1) space.",
  },
  {
    id: "reverse-list",
    title: "Reverse a Sequence",
    difficulty: "Easy",
    topics: ["Linked lists", "Arrays"],
    statement:
      "Return the values in a singly linked-list sequence in reverse order. The input is represented as an array.",
    inputDescription: "An array of node values.",
    outputDescription: "The reversed array.",
    constraints: ["0 <= values.length <= 100,000"],
    tests: [
      { input: [1, 2, 3, 4], expected: [4, 3, 2, 1] },
      { input: [], expected: [] },
      { input: [9], expected: [9] },
    ],
    starter: "function solve(values) {\n}",
    solution: "function solve(values) { return [...values].reverse(); }",
    hints: [
      "The array is a compact representation of the node order.",
      "Return a reversed copy so the input remains unchanged.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "valid-brackets",
    title: "Balanced Brackets",
    difficulty: "Easy",
    topics: ["Stacks and queues", "Strings"],
    statement:
      "Return true if every opening bracket is closed by the same type in the correct order.",
    inputDescription: "A string containing only ()[]{}.",
    outputDescription: "A boolean.",
    constraints: ["0 <= text.length <= 10,000"],
    tests: [
      { input: "([]{})", expected: true },
      { input: "([)]", expected: false },
      { input: "", expected: true },
    ],
    starter: "function solve(text) {\n}",
    solution:
      'function solve(text) { const pairs = { ")": "(", "]": "[", "}": "{" }; const stack = []; for (const c of text) { if (c in pairs) { if (stack.pop() !== pairs[c]) return false; } else stack.push(c); } return stack.length === 0; }',
    hints: [
      "The most recent unmatched opener must close first.",
      "Use a stack and check the matching type on each closer.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "daily-warmth",
    title: "Days Until Warmer",
    difficulty: "Medium",
    topics: ["Stacks and queues", "Arrays"],
    statement:
      "For each temperature, return how many days until a warmer temperature, or 0 if none exists.",
    inputDescription: "An array of temperatures.",
    outputDescription: "An array of wait lengths.",
    constraints: ["1 <= temperatures.length <= 100,000"],
    tests: [
      {
        input: [73, 74, 75, 71, 69, 72, 76, 73],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
      },
      { input: [30, 40, 50, 60], expected: [1, 1, 1, 0] },
      { input: [50, 40], expected: [0, 0] },
    ],
    starter: "function solve(temperatures) {\n}",
    solution:
      "function solve(temperatures) { const out = Array(temperatures.length).fill(0), stack = []; for (let i = 0; i < temperatures.length; i++) { while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) { const j = stack.pop(); out[j] = i - j; } stack.push(i); } return out; }",
    hints: [
      "Keep indices of days that still await a warmer temperature.",
      "A warmer day resolves smaller temperatures at the top of a monotonic stack.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "tree-depth",
    title: "Maximum Tree Depth",
    difficulty: "Easy",
    topics: ["Trees", "Recursion"],
    statement:
      "Return the maximum depth of a binary tree represented as nested objects {value,left,right}.",
    inputDescription: "A tree node object or null.",
    outputDescription: "The number of nodes on the longest root-to-leaf path.",
    constraints: ["The tree contains at most 10,000 nodes."],
    tests: [
      {
        input: {
          value: 1,
          left: { value: 2, left: null, right: null },
          right: { value: 3, left: null, right: null },
        },
        expected: 2,
      },
      { input: null, expected: 0 },
      {
        input: {
          value: 1,
          left: null,
          right: { value: 2, left: null, right: null },
        },
        expected: 2,
      },
    ],
    starter: "function solve(root) {\n}",
    solution:
      "function solve(root) { if (!root) return 0; return 1 + Math.max(solve(root.left), solve(root.right)); }",
    hints: [
      "An empty tree contributes depth zero.",
      "The depth is one plus the deeper child.",
    ],
    complexity: "O(n) time, O(h) call stack.",
  },
  {
    id: "level-order",
    title: "Tree Level Order",
    difficulty: "Medium",
    topics: ["Trees", "Stacks and queues"],
    statement:
      "Return the values of a binary tree grouped by depth, left to right.",
    inputDescription: "A nested tree object {value,left,right} or null.",
    outputDescription: "An array of level arrays.",
    constraints: ["The tree contains at most 10,000 nodes."],
    tests: [
      {
        input: {
          value: 3,
          left: { value: 9, left: null, right: null },
          right: {
            value: 20,
            left: { value: 15, left: null, right: null },
            right: { value: 7, left: null, right: null },
          },
        },
        expected: [[3], [9, 20], [15, 7]],
      },
      { input: null, expected: [] },
      { input: { value: 1, left: null, right: null }, expected: [[1]] },
    ],
    starter: "function solve(root) {\n}",
    solution:
      "function solve(root) { if (!root) return []; const out = [], queue = [root]; for (let i = 0; i < queue.length;) { const end = queue.length, level = []; while (i < end) { const node = queue[i++]; level.push(node.value); if (node.left) queue.push(node.left); if (node.right) queue.push(node.right); } out.push(level); } return out; }",
    hints: [
      "A queue naturally visits nodes in breadth-first order.",
      "Process the queue length at the start of each level.",
    ],
    complexity: "O(n) time, O(w) space.",
  },
  {
    id: "island-count",
    title: "Count Island Groups",
    difficulty: "Medium",
    topics: ["Graphs", "Recursion"],
    statement:
      "Count connected groups of 1s in a rectangular grid. Connections are horizontal or vertical.",
    inputDescription: "A grid of string rows containing 0 and 1.",
    outputDescription: "The number of connected land groups.",
    constraints: ["Grid dimensions are at most 300 by 300."],
    tests: [
      { input: ["110", "010", "001"], expected: 2 },
      { input: ["000", "000"], expected: 0 },
      { input: ["111", "111"], expected: 1 },
    ],
    starter: "function solve(grid) {\n}",
    solution:
      'function solve(grid) { if (!grid.length) return 0; const seen = new Set(); let count = 0; const visit = (r, c) => { const key = r + "," + c; if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== "1" || seen.has(key)) return; seen.add(key); visit(r + 1, c); visit(r - 1, c); visit(r, c + 1); visit(r, c - 1); }; for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c] === "1" && !seen.has(r + "," + c)) { count++; visit(r, c); } return count; }',
    hints: [
      "Each unseen land cell starts a new component.",
      "Mark all reachable neighbors when exploring one component.",
    ],
    complexity: "O(rows * cols) time, O(rows * cols) space.",
  },
  {
    id: "shortest-grid-path",
    title: "Shortest Grid Steps",
    difficulty: "Hard",
    topics: ["Graphs", "Stacks and queues"],
    statement:
      "Find the fewest 4-directional steps from top-left to bottom-right. 0 is open and 1 is blocked; return -1 if unreachable.",
    inputDescription: "A rectangular grid of 0 and 1 integers.",
    outputDescription: "A step count or -1.",
    constraints: ["Grid dimensions are at most 100 by 100."],
    tests: [
      {
        input: [
          [0, 0, 1],
          [1, 0, 0],
          [0, 0, 0],
        ],
        expected: 4,
      },
      {
        input: [
          [0, 1],
          [1, 0],
        ],
        expected: -1,
      },
      { input: [[0]], expected: 0 },
    ],
    starter: "function solve(grid) {\n}",
    solution:
      'function solve(grid) { const rows = grid.length, cols = grid[0].length; if (grid[0][0] || grid[rows - 1][cols - 1]) return -1; const q = [[0, 0, 0]], seen = new Set(["0,0"]); for (let i = 0; i < q.length; i++) { const [r, c, d] = q[i]; if (r === rows - 1 && c === cols - 1) return d; for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nr = r + dr, nc = c + dc, key = nr + "," + nc; if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !grid[nr][nc] && !seen.has(key)) { seen.add(key); q.push([nr, nc, d + 1]); } } } return -1; }',
    hints: [
      "Breadth-first search finds the shortest path in an unweighted grid.",
      "Track visited cells so each open cell is enqueued once.",
    ],
    complexity: "O(rows * cols) time and space.",
  },
  {
    id: "climb-steps",
    title: "Ways Up the Steps",
    difficulty: "Easy",
    topics: ["Dynamic programming"],
    statement: "Count ways to reach step n when each move is one or two steps.",
    inputDescription: "A non-negative integer n.",
    outputDescription: "The number of distinct ways.",
    constraints: ["0 <= n <= 45"],
    tests: [
      { input: 4, expected: 5 },
      { input: 2, expected: 2 },
      { input: 0, expected: 1 },
    ],
    starter: "function solve(n) {\n}",
    solution:
      "function solve(n) { let a = 1, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; }",
    hints: [
      "Ways to reach n come from n-1 or n-2.",
      "Keep only the previous two counts.",
    ],
    complexity: "O(n) time, O(1) space.",
  },
  {
    id: "coin-change",
    title: "Minimum Coins",
    difficulty: "Medium",
    topics: ["Dynamic programming"],
    statement:
      "Return the fewest coins needed to make amount, or -1 if it cannot be formed.",
    inputDescription: "An object with positive coin values and amount.",
    outputDescription: "A minimum coin count or -1.",
    constraints: ["0 <= amount <= 10,000"],
    tests: [
      { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
      { input: { coins: [2], amount: 3 }, expected: -1 },
      { input: { coins: [1], amount: 0 }, expected: 0 },
    ],
    starter: "function solve({ coins, amount }) {\n}",
    solution:
      "function solve({ coins, amount }) { const dp = Array(amount + 1).fill(Infinity); dp[0] = 0; for (let value = 1; value <= amount; value++) for (const coin of coins) if (coin <= value) dp[value] = Math.min(dp[value], dp[value - coin] + 1); return dp[amount] === Infinity ? -1 : dp[amount]; }",
    hints: [
      "Build the answer for every smaller amount.",
      "For each value, consider adding one coin to a reachable remainder.",
    ],
    complexity: "O(amount * coins.length) time, O(amount) space.",
  },
  {
    id: "longest-palindrome",
    title: "Longest Palindrome Length",
    difficulty: "Medium",
    topics: ["Strings", "Hash maps"],
    statement:
      "Return the maximum length of a palindrome that can be built from the characters in text.",
    inputDescription: "A case-sensitive string.",
    outputDescription: "An integer length.",
    constraints: ["text.length <= 100,000"],
    tests: [
      { input: "abccccdd", expected: 7 },
      { input: "a", expected: 1 },
      { input: "Aa", expected: 1 },
    ],
    starter: "function solve(text) {\n}",
    solution:
      "function solve(text) { const counts = new Map(); for (const c of text) counts.set(c, (counts.get(c) || 0) + 1); let length = 0, odd = false; for (const n of counts.values()) { length += Math.floor(n / 2) * 2; if (n % 2) odd = true; } return length + Number(odd); }",
    hints: [
      "Pairs can be placed symmetrically around the center.",
      "Use every even portion and at most one odd center.",
    ],
    complexity: "O(n) time, O(k) space.",
  },
  {
    id: "stock-profit",
    title: "Single Trade Profit",
    difficulty: "Easy",
    topics: ["Arrays", "Dynamic programming"],
    statement:
      "Return the maximum profit from one buy followed by one later sell, or 0 when no profit is possible.",
    inputDescription: "An array of daily prices.",
    outputDescription: "A non-negative integer profit.",
    constraints: ["1 <= prices.length <= 100,000"],
    tests: [
      { input: [7, 1, 5, 3, 6, 4], expected: 5 },
      { input: [7, 6, 4, 3], expected: 0 },
      { input: [2, 4], expected: 2 },
    ],
    starter: "function solve(prices) {\n}",
    solution:
      "function solve(prices) { let low = Infinity, profit = 0; for (const price of prices) { low = Math.min(low, price); profit = Math.max(profit, price - low); } return profit; }",
    hints: [
      "A sale is only useful relative to the lowest prior price.",
      "Track the minimum so far and best difference.",
    ],
    complexity: "O(n) time, O(1) space.",
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    topics: ["Strings", "Hash maps"],
    statement:
      "Group words that are anagrams. Return groups in order of first appearance.",
    inputDescription: "An array of lowercase words.",
    outputDescription: "An array of groups of words.",
    constraints: ["All words contain lowercase letters."],
    tests: [
      {
        input: ["eat", "tea", "tan", "ate", "nat", "bat"],
        expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
      },
      { input: [""], expected: [[""]] },
      { input: ["a"], expected: [["a"]] },
    ],
    starter: "function solve(words) {\n}",
    solution:
      'function solve(words) { const groups = new Map(); for (const word of words) { const key = [...word].sort().join(""); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(word); } return [...groups.values()]; }',
    hints: [
      "Anagrams share a canonical character signature.",
      "Use sorted letters as the map key.",
    ],
    complexity: "O(n * k log k) time, O(nk) space.",
  },
  {
    id: "merge-sorted",
    title: "Merge Sorted Arrays",
    difficulty: "Easy",
    topics: ["Arrays", "Two pointers", "Sorting"],
    statement: "Merge two sorted ascending arrays into one sorted array.",
    inputDescription: "An object with sorted arrays a and b.",
    outputDescription: "One sorted array.",
    constraints: ["Values are integers."],
    tests: [
      { input: { a: [1, 3, 5], b: [2, 4, 6] }, expected: [1, 2, 3, 4, 5, 6] },
      { input: { a: [], b: [0] }, expected: [0] },
      { input: { a: [1, 1], b: [1] }, expected: [1, 1, 1] },
    ],
    starter: "function solve({ a, b }) {\n}",
    solution:
      "function solve({ a, b }) { const out = []; let i = 0, j = 0; while (i < a.length || j < b.length) { if (j >= b.length || (i < a.length && a[i] <= b[j])) out.push(a[i++]); else out.push(b[j++]); } return out; }",
    hints: [
      "The smallest remaining value must be at one of the two fronts.",
      "Advance the pointer belonging to the smaller value.",
    ],
    complexity: "O(n + m) time, O(n + m) space.",
  },
  {
    id: "fibonacci",
    title: "Fibonacci Value",
    difficulty: "Easy",
    topics: ["Recursion", "Dynamic programming"],
    statement: "Return the nth Fibonacci number with F(0)=0 and F(1)=1.",
    inputDescription: "An integer n.",
    outputDescription: "An integer Fibonacci value.",
    constraints: ["0 <= n <= 45"],
    tests: [
      { input: 7, expected: 13 },
      { input: 0, expected: 0 },
      { input: 1, expected: 1 },
    ],
    starter: "function solve(n) {\n}",
    solution:
      "function solve(n) { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; }",
    hints: [
      "Each value depends on the prior two values.",
      "Iterate while keeping just those two values.",
    ],
    complexity: "O(n) time, O(1) space.",
  },
  {
    id: "window-average",
    title: "Best Window Average",
    difficulty: "Medium",
    topics: ["Sliding window", "Arrays"],
    statement:
      "Return the largest average among all contiguous windows of size k.",
    inputDescription: "An object with nums and positive k.",
    outputDescription: "A number average.",
    constraints: ["1 <= k <= nums.length"],
    tests: [
      { input: { nums: [1, 12, -5, -6, 50, 3], k: 4 }, expected: 12.75 },
      { input: { nums: [5], k: 1 }, expected: 5 },
      { input: { nums: [0, 4, 0, 3], k: 2 }, expected: 2 },
    ],
    starter: "function solve({ nums, k }) {\n}",
    solution:
      "function solve({ nums, k }) { let sum = nums.slice(0, k).reduce((a, b) => a + b, 0), best = sum; for (let i = k; i < nums.length; i++) { sum += nums[i] - nums[i - k]; best = Math.max(best, sum); } return best / k; }",
    hints: [
      "Neighboring windows share all but two values.",
      "Update the rolling sum by removing the leaving value and adding the entering value.",
    ],
    complexity: "O(n) time, O(1) extra space.",
  },
  {
    id: "word-search",
    title: "Prefix Match",
    difficulty: "Easy",
    topics: ["Strings", "Sorting"],
    statement:
      "Return the longest common prefix among all input words, or an empty string.",
    inputDescription: "An array of strings.",
    outputDescription: "A common prefix.",
    constraints: ["0 <= words.length <= 10,000"],
    tests: [
      { input: ["flower", "flow", "flight"], expected: "fl" },
      { input: ["dog", "racecar", "car"], expected: "" },
      { input: ["alone"], expected: "alone" },
    ],
    starter: "function solve(words) {\n}",
    solution:
      'function solve(words) { if (!words.length) return ""; let prefix = words[0]; for (const word of words.slice(1)) { while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1); } return prefix; }',
    hints: [
      "A shared prefix can only shrink as you inspect more words.",
      "Shorten the current prefix until the next word starts with it.",
    ],
    complexity: "O(total characters) time, O(1) extra space.",
  },
  {
    id: "product-except-self",
    title: "Products Except Self",
    difficulty: "Medium",
    topics: ["Arrays"],
    statement:
      "Return an array where each position is the product of every other input value. Do not use division.",
    inputDescription: "An integer array.",
    outputDescription: "An output array of equal length.",
    constraints: ["The product fits in a 32-bit integer."],
    tests: [
      { input: [1, 2, 3, 4], expected: [24, 12, 8, 6] },
      { input: [-1, 1, 0, -3, 3], expected: [0, 0, 9, 0, 0] },
      { input: [2, 3], expected: [3, 2] },
    ],
    starter: "function solve(nums) {\n}",
    solution:
      "function solve(nums) { const out = Array(nums.length).fill(1); let prefix = 1; for (let i = 0; i < nums.length; i++) { out[i] = prefix; prefix *= nums[i]; } let suffix = 1; for (let i = nums.length - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; } return out; }",
    hints: [
      "Each result combines the product to its left and to its right.",
      "Use two passes and store one side in the output array.",
    ],
    complexity: "O(n) time, O(1) extra space beyond output.",
  },
  {
    id: "valid-palindrome",
    title: "Clean Palindrome",
    difficulty: "Easy",
    topics: ["Strings", "Two pointers"],
    statement:
      "Check whether text reads the same forward and backward after lowercasing and removing non-alphanumeric characters.",
    inputDescription: "A string.",
    outputDescription: "A boolean.",
    constraints: ["text.length <= 100,000"],
    tests: [
      { input: "A man, a plan, a canal: Panama", expected: true },
      { input: "race a car", expected: false },
      { input: " ", expected: true },
    ],
    starter: "function solve(text) {\n}",
    solution:
      'function solve(text) { const clean = text.toLowerCase().replace(/[^a-z0-9]/g, ""); let left = 0, right = clean.length - 1; while (left < right) if (clean[left++] !== clean[right--]) return false; return true; }',
    hints: [
      "Ignore characters outside the chosen alphabet.",
      "Compare inward from both ends.",
    ],
    complexity: "O(n) time, O(n) space.",
  },
  {
    id: "top-frequency",
    title: "Most Frequent Values",
    difficulty: "Medium",
    topics: ["Hash maps", "Sorting"],
    statement:
      "Return the k most frequent values, sorted by descending frequency then ascending numeric value.",
    inputDescription: "An object with nums and k.",
    outputDescription: "An array of k values.",
    constraints: ["1 <= k <= number of unique values."],
    tests: [
      { input: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, expected: [1, 2] },
      { input: { nums: [4, 4, 2, 2, 7], k: 2 }, expected: [2, 4] },
      { input: { nums: [5], k: 1 }, expected: [5] },
    ],
    starter: "function solve({ nums, k }) {\n}",
    solution:
      "function solve({ nums, k }) { const counts = new Map(); for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1); return [...counts].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, k).map(([n]) => n); }",
    hints: [
      "Count values before ranking them.",
      "Sort by count first and apply the specified tie-break.",
    ],
    complexity: "O(n + u log u) time, O(u) space.",
  },
  {
    id: "first-missing-positive",
    title: "First Missing Positive",
    difficulty: "Hard",
    topics: ["Arrays", "Hash maps"],
    statement:
      "Return the smallest positive integer that does not appear in nums.",
    inputDescription: "An array of integers that may include zero and negatives.",
    outputDescription: "The smallest missing positive integer.",
    constraints: ["1 <= nums.length <= 100,000"],
    tests: [
      { input: [1, 2, 0], expected: 3 },
      { input: [3, 4, -1, 1], expected: 2 },
      { input: [7, 8, 9, 11, 12], expected: 1 },
    ],
    starter: "function solve(nums) {\n}",
    solution:
      "function solve(nums) { const seen = new Set(nums); let value = 1; while (seen.has(value)) value++; return value; }",
    hints: [
      "Only positive integers can be the answer.",
      "Check consecutive candidates starting at one using a Set.",
    ],
    complexity: "O(n) expected time and O(n) space.",
  },
  {
    id: "longest-unique-window",
    title: "Longest Unique Substring",
    difficulty: "Medium",
    topics: ["Strings", "Sliding window", "Hash maps"],
    statement:
      "Return the length of the longest substring that contains no repeated characters.",
    inputDescription: "A string.",
    outputDescription: "The maximum valid substring length.",
    constraints: ["0 <= text.length <= 100,000"],
    tests: [
      { input: "abcabcbb", expected: 3 },
      { input: "bbbbb", expected: 1 },
      { input: "", expected: 0 },
    ],
    starter: "function solve(text) {\n}",
    solution:
      "function solve(text) { const last = new Map(); let start = 0, best = 0; for (let i = 0; i < text.length; i++) { if (last.has(text[i])) start = Math.max(start, last.get(text[i]) + 1); last.set(text[i], i); best = Math.max(best, i - start + 1); } return best; }",
    hints: [
      "Maintain a window whose characters are all distinct.",
      "Remember each character's last index and move the left edge past repeats.",
    ],
    complexity: "O(n) time and O(k) space for distinct characters.",
  },
  {
    id: "search-range",
    title: "Find Target Range",
    difficulty: "Medium",
    topics: ["Arrays", "Binary search"],
    statement:
      "In a sorted array, return the first and last index of target, or [-1, -1] when it is absent.",
    inputDescription: "An object containing sorted nums and target.",
    outputDescription: "A two-index range or [-1, -1].",
    constraints: ["nums is sorted in ascending order."],
    tests: [
      { input: { nums: [5, 7, 7, 8, 8, 10], target: 8 }, expected: [3, 4] },
      { input: { nums: [5, 7, 7, 8, 8, 10], target: 6 }, expected: [-1, -1] },
      { input: { nums: [], target: 0 }, expected: [-1, -1] },
    ],
    starter: "function solve({ nums, target }) {\n}",
    solution:
      "function solve({ nums, target }) { const bound = upper => { let lo = 0, hi = nums.length; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (nums[mid] > target || (!upper && nums[mid] === target)) hi = mid; else lo = mid + 1; } return lo; }; const first = bound(false); if (first === nums.length || nums[first] !== target) return [-1, -1]; return [first, bound(true) - 1]; }",
    hints: [
      "Use binary search to find the insertion boundaries around target.",
      "Find the first value not below target and the first value above it.",
    ],
    complexity: "O(log n) time and O(1) space.",
  },
  {
    id: "kth-largest",
    title: "Kth Largest Value",
    difficulty: "Medium",
    topics: ["Arrays", "Sorting"],
    statement:
      "Return the kth largest value in nums. Duplicate values occupy separate positions in the ranking.",
    inputDescription: "An object containing nums and a one-based k.",
    outputDescription: "The kth largest number.",
    constraints: ["1 <= k <= nums.length"],
    tests: [
      { input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expected: 5 },
      { input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expected: 4 },
      { input: { nums: [-1, -2, -3], k: 1 }, expected: -1 },
    ],
    starter: "function solve({ nums, k }) {\n}",
    solution:
      "function solve({ nums, k }) { return [...nums].sort((a, b) => b - a)[k - 1]; }",
    hints: [
      "Translate kth largest into a position in descending order.",
      "A straightforward solution sorts a copy so the input stays unchanged.",
    ],
    complexity: "O(n log n) time and O(n) space for the sorted copy.",
  },
  {
    id: "postfix-evaluation",
    title: "Evaluate Postfix Expression",
    difficulty: "Medium",
    topics: ["Stacks and queues", "Strings"],
    statement:
      "Evaluate an expression in reverse Polish notation using integer division truncated toward zero.",
    inputDescription:
      "An array of integer strings and the operators +, -, *, and /.",
    outputDescription: "The integer result.",
    constraints: ["The input is a valid postfix expression."],
    tests: [
      { input: ["2", "1", "+", "3", "*"], expected: 9 },
      { input: ["4", "13", "5", "/", "+"], expected: 6 },
      { input: ["-7", "3", "/"], expected: -2 },
    ],
    starter: "function solve(tokens) {\n}",
    solution:
      "function solve(tokens) { const stack = []; for (const token of tokens) { if ([\"+\", \"-\", \"*\", \"/\"].includes(token)) { const right = stack.pop(), left = stack.pop(); if (token === \"+\") stack.push(left + right); else if (token === \"-\") stack.push(left - right); else if (token === \"*\") stack.push(left * right); else stack.push(Math.trunc(left / right)); } else stack.push(Number(token)); } return stack[0]; }",
    hints: [
      "Operators consume the two most recent values.",
      "Push numbers on a stack; for an operator, pop right then left.",
    ],
    complexity: "O(n) time and O(n) space.",
  },
  {
    id: "simplify-path",
    title: "Normalize an Absolute Path",
    difficulty: "Medium",
    topics: ["Strings", "Stacks and queues"],
    statement:
      "Normalize an absolute Unix-style path by removing repeated separators, dot segments, and parent segments where possible.",
    inputDescription: "An absolute path string.",
    outputDescription: "A normalized path beginning with one slash.",
    constraints: ["path begins with /."],
    tests: [
      { input: "/home/", expected: "/home" },
      { input: "/a/../../b/../c//", expected: "/c" },
      { input: "/../", expected: "/" },
    ],
    starter: "function solve(path) {\n}",
    solution:
      "function solve(path) { const stack = []; for (const part of path.split(\"/\")) { if (!part || part === \".\") continue; if (part === \"..\") stack.pop(); else stack.push(part); } return \"/\" + stack.join(\"/\"); }",
    hints: [
      "Split the path into segments and ignore empty or current-directory parts.",
      "A parent segment removes the last directory already on the stack.",
    ],
    complexity: "O(n) time and O(n) space.",
  },
  {
    id: "flood-fill",
    title: "Recolor a Connected Region",
    difficulty: "Easy",
    topics: ["Graphs", "Arrays"],
    statement:
      "Starting at row sr and column sc, recolor every 4-directionally connected cell with the starting cell's original color. Return a new image.",
    inputDescription: "An object containing image, sr, sc, and color.",
    outputDescription: "A copied image with the connected region recolored.",
    constraints: ["The image is a non-empty rectangular grid."],
    tests: [
      { input: { image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 }, expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { input: { image: [[0, 0], [0, 0]], sr: 0, sc: 0, color: 0 }, expected: [[0, 0], [0, 0]] },
      { input: { image: [[1]], sr: 0, sc: 0, color: 3 }, expected: [[3]] },
    ],
    starter: "function solve({ image, sr, sc, color }) {\n}",
    solution:
      "function solve({ image, sr, sc, color }) { const out = image.map(row => [...row]); const original = out[sr][sc]; if (original === color) return out; const queue = [[sr, sc]]; out[sr][sc] = color; for (let i = 0; i < queue.length; i++) { const [r, c] = queue[i]; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nc >= 0 && nr < out.length && nc < out[0].length && out[nr][nc] === original) { out[nr][nc] = color; queue.push([nr, nc]); } } } return out; }",
    hints: [
      "Only cells matching the starting color belong to this region.",
      "Use breadth-first search and recolor a cell when you enqueue it.",
    ],
    complexity: "O(rows * columns) time and space.",
  },
  {
    id: "graph-components",
    title: "Count Connected Components",
    difficulty: "Medium",
    topics: ["Graphs", "Stacks and queues"],
    statement:
      "Given an undirected graph with vertices 0 through n-1, return its number of connected components.",
    inputDescription: "An object containing n and an edge-pair array.",
    outputDescription: "The number of connected components.",
    constraints: ["0 <= n <= 100,000"],
    tests: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] }, expected: 2 },
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expected: 1 },
      { input: { n: 0, edges: [] }, expected: 0 },
    ],
    starter: "function solve({ n, edges }) {\n}",
    solution:
      "function solve({ n, edges }) { const graph = Array.from({ length: n }, () => []); for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); } const seen = new Set(); let count = 0; for (let start = 0; start < n; start++) { if (seen.has(start)) continue; count++; const queue = [start]; seen.add(start); for (let i = 0; i < queue.length; i++) for (const next of graph[queue[i]]) if (!seen.has(next)) { seen.add(next); queue.push(next); } } return count; }",
    hints: [
      "Every unvisited vertex begins a new component traversal.",
      "Build an adjacency list, then run BFS from each unseen vertex.",
    ],
    complexity: "O(n + e) time and space.",
  },
  {
    id: "jump-reachability",
    title: "Can Reach the Last Index?",
    difficulty: "Medium",
    topics: ["Arrays", "Greedy"],
    statement:
      "Each value tells the maximum forward jump from that index. Return whether the last index is reachable from index zero.",
    inputDescription: "An array of non-negative jump lengths.",
    outputDescription: "A boolean.",
    constraints: ["1 <= nums.length <= 100,000"],
    tests: [
      { input: [2, 3, 1, 1, 4], expected: true },
      { input: [3, 2, 1, 0, 4], expected: false },
      { input: [0], expected: true },
    ],
    starter: "function solve(nums) {\n}",
    solution:
      "function solve(nums) { let farthest = 0; for (let i = 0; i < nums.length && i <= farthest; i++) { farthest = Math.max(farthest, i + nums[i]); if (farthest >= nums.length - 1) return true; } return nums.length === 1; }",
    hints: [
      "Track the farthest index reachable from any position visited so far.",
      "If the scan reaches an index beyond that frontier, the end is unreachable.",
    ],
    complexity: "O(n) time and O(1) space.",
  },
  {
    id: "unique-grid-paths",
    title: "Count Grid Paths",
    difficulty: "Medium",
    topics: ["Dynamic programming", "Arrays"],
    statement:
      "Count paths from the top-left to the bottom-right of an m by n grid when each move goes only right or down.",
    inputDescription: "An object containing positive integers m and n.",
    outputDescription: "The number of distinct paths.",
    constraints: ["1 <= m, n <= 20"],
    tests: [
      { input: { m: 3, n: 7 }, expected: 28 },
      { input: { m: 3, n: 2 }, expected: 3 },
      { input: { m: 1, n: 1 }, expected: 1 },
    ],
    starter: "function solve({ m, n }) {\n}",
    solution:
      "function solve({ m, n }) { const dp = Array(n).fill(1); for (let r = 1; r < m; r++) for (let c = 1; c < n; c++) dp[c] += dp[c - 1]; return dp[n - 1]; }",
    hints: [
      "Every cell can be reached from the cell above or the cell to its left.",
      "Keep one row of counts and update it from left to right.",
    ],
    complexity: "O(m * n) time and O(n) space.",
  },
  {
    id: "edit-distance",
    title: "Minimum Edit Distance",
    difficulty: "Hard",
    topics: ["Dynamic programming", "Strings"],
    statement:
      "Return the minimum number of single-character insertions, deletions, and substitutions needed to change word a into word b.",
    inputDescription: "An object containing strings a and b.",
    outputDescription: "A non-negative edit count.",
    constraints: ["0 <= a.length, b.length <= 500"],
    tests: [
      { input: { a: "horse", b: "ros" }, expected: 3 },
      { input: { a: "intention", b: "execution" }, expected: 5 },
      { input: { a: "", b: "abc" }, expected: 3 },
    ],
    starter: "function solve({ a, b }) {\n}",
    solution:
      "function solve({ a, b }) { const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0)); for (let i = 0; i <= a.length; i++) dp[i][0] = i; for (let j = 0; j <= b.length; j++) dp[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); return dp[a.length][b.length]; }",
    hints: [
      "Compare prefixes of both words and build the best answer for each pair.",
      "A mismatch considers insertion, deletion, or substitution from smaller prefixes.",
    ],
    complexity: "O(m * n) time and O(m * n) space.",
  },
  {
    id: "meeting-rooms",
    title: "Minimum Meeting Rooms",
    difficulty: "Medium",
    topics: ["Sorting", "Arrays"],
    statement:
      "Return the minimum number of rooms needed for all half-open meeting intervals [start, end). Meetings that touch at an endpoint can share a room.",
    inputDescription: "An array of [start, end] interval pairs.",
    outputDescription: "The peak number of simultaneous meetings.",
    constraints: ["0 <= intervals.length <= 100,000"],
    tests: [
      { input: [[0, 30], [5, 10], [15, 20]], expected: 2 },
      { input: [[7, 10], [2, 4]], expected: 1 },
      { input: [[1, 5], [5, 8]], expected: 1 },
    ],
    starter: "function solve(intervals) {\n}",
    solution:
      "function solve(intervals) { const events = intervals.flatMap(([start, end]) => [[start, 1], [end, -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); let active = 0, peak = 0; for (const [, change] of events) { active += change; peak = Math.max(peak, active); } return peak; }",
    hints: [
      "A room is needed for every meeting active at the same time.",
      "Sort start/end events and process end events before starts at equal times.",
    ],
    complexity: "O(n log n) time and O(n) space.",
  },
  {
    id: "rotate-matrix",
    title: "Rotate a Matrix Clockwise",
    difficulty: "Medium",
    topics: ["Arrays", "Two pointers"],
    statement:
      "Return a new matrix rotated 90 degrees clockwise. The input may be rectangular.",
    inputDescription: "A rectangular matrix of values.",
    outputDescription: "A new matrix with swapped dimensions.",
    constraints: ["The input has at least one row and one column."],
    tests: [
      { input: [[1, 2, 3], [4, 5, 6]], expected: [[4, 1], [5, 2], [6, 3]] },
      { input: [[1]], expected: [[1]] },
      { input: [[1, 2], [3, 4]], expected: [[3, 1], [4, 2]] },
    ],
    starter: "function solve(matrix) {\n}",
    solution:
      "function solve(matrix) { const rows = matrix.length, cols = matrix[0].length; return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => matrix[rows - 1 - r][c])); }",
    hints: [
      "A cell at row r and column c moves to a new row based on its old column.",
      "Build each output row from one input column, read from bottom to top.",
    ],
    complexity: "O(rows * columns) time and output space.",
  },
  {
    id: "run-length-encode",
    title: "Run-Length Encode",
    difficulty: "Easy",
    topics: ["Strings", "Two pointers"],
    statement:
      "Compress each consecutive run of the same character into the character followed by its count. Keep count 1 in the output too.",
    inputDescription: "A string of characters.",
    outputDescription: "The encoded string; empty input returns empty output.",
    constraints: ["text.length <= 100,000"],
    tests: [
      { input: "aaabbc", expected: "a3b2c1" },
      { input: "abcd", expected: "a1b1c1d1" },
      { input: "", expected: "" },
    ],
    starter: "function solve(text) {\n}",
    solution:
      "function solve(text) { const out = []; for (let i = 0; i < text.length;) { let end = i + 1; while (end < text.length && text[end] === text[i]) end++; out.push(text[i] + (end - i)); i = end; } return out.join(\"\"); }",
    hints: [
      "Scan one run at a time rather than comparing every pair of characters.",
      "Find the first different character, then append the run and its length.",
    ],
    complexity: "O(n) time and O(n) output space.",
  },
  {
    id: "lis-length",
    title: "Longest Increasing Subsequence Length",
    difficulty: "Medium",
    topics: ["Dynamic programming", "Binary search", "Arrays"],
    statement:
      "Return the length of the longest strictly increasing subsequence. The selected values need not be adjacent.",
    inputDescription: "An integer array.",
    outputDescription: "The subsequence length, or 0 for empty input.",
    constraints: ["nums.length <= 100,000"],
    tests: [
      { input: [10, 9, 2, 5, 3, 7, 101, 18], expected: 4 },
      { input: [0, 1, 0, 3, 2, 3], expected: 4 },
      { input: [7, 7, 7, 7], expected: 1 },
    ],
    starter: "function solve(nums) {\n}",
    solution:
      "function solve(nums) { const tails = []; for (const value of nums) { let lo = 0, hi = tails.length; while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (tails[mid] < value) lo = mid + 1; else hi = mid; } tails[lo] = value; } return tails.length; }",
    hints: [
      "Keep the smallest possible tail value for each subsequence length.",
      "Use binary search to replace the first tail that is not smaller than the current value.",
    ],
    complexity: "O(n log n) time and O(n) space.",
  },
  {
    id: "validate-bst",
    title: "Validate a Binary Search Tree",
    difficulty: "Medium",
    topics: ["Trees", "Recursion"],
    statement:
      "Return true when a binary tree satisfies strict BST ordering at every node. Nodes use {value,left,right}; an empty tree is valid.",
    inputDescription: "A nested node object or null.",
    outputDescription: "A boolean.",
    constraints: ["Node values are finite numbers."],
    tests: [
      { input: { value: 2, left: { value: 1, left: null, right: null }, right: { value: 3, left: null, right: null } }, expected: true },
      { input: { value: 5, left: { value: 1, left: null, right: null }, right: { value: 4, left: { value: 3, left: null, right: null }, right: { value: 6, left: null, right: null } } }, expected: false },
      { input: null, expected: true },
    ],
    starter: "function solve(root) {\n}",
    solution:
      "function solve(root) { const visit = (node, low, high) => { if (!node) return true; if (node.value <= low || node.value >= high) return false; return visit(node.left, low, node.value) && visit(node.right, node.value, high); }; return visit(root, -Infinity, Infinity); }",
    hints: [
      "Checking only each node against its immediate children is not enough.",
      "Pass lower and upper bounds down the recursion.",
    ],
    complexity: "O(n) time and O(h) recursion space.",
  },
];

const additionalQuestions: QuestionSeed[] = [
  {
    id: "minimum-window",
    title: "Minimum Covering Window",
    difficulty: "Hard",
    topics: ["Strings", "Sliding window", "Hash maps"],
    statement:
      "Return the shortest substring of text containing every character in pattern with at least its required frequency, or an empty string if none exists.",
    inputDescription: "An object containing strings text and pattern.",
    outputDescription: "The shortest matching substring; ties keep the earliest.",
    constraints: ["text.length <= 1,000", "pattern.length <= text.length"],
    tests: [
      { input: { text: "ADOBECODEBANC", pattern: "ABC" }, expected: "BANC" },
      { input: { text: "a", pattern: "a" }, expected: "a" },
      { input: { text: "a", pattern: "aa" }, expected: "" },
    ],
    starter: "function solve({ text, pattern }) {\n}",
    solution:
      "function solve({ text, pattern }) { if (!pattern) return \"\"; const need = new Map(); for (const c of pattern) need.set(c, (need.get(c) || 0) + 1); let missing = pattern.length, left = 0, bestStart = 0, bestLength = Infinity; for (let right = 0; right < text.length; right++) { const c = text[right]; if (need.has(c)) { if (need.get(c) > 0) missing--; need.set(c, need.get(c) - 1); } while (missing === 0) { if (right - left + 1 < bestLength) { bestStart = left; bestLength = right - left + 1; } const drop = text[left++]; if (need.has(drop)) { need.set(drop, need.get(drop) + 1); if (need.get(drop) > 0) missing++; } } } return bestLength === Infinity ? \"\" : text.slice(bestStart, bestStart + bestLength); }",
    hints: [
      "Expand a window until it contains all required character counts.",
      "Once valid, shrink from the left while recording the smallest valid range.",
    ],
    complexity: "O(n + m) time and O(k) space.",
  },
];

seedQuestions.push(...additionalQuestions);

const COMPANY_PREP_TOPICS: Record<string, string[]> = {
  Google: ["Arrays", "Hash maps", "Trees", "Graphs", "Dynamic programming", "Binary search", "Sliding window", "Two pointers", "Recursion"],
  IBM: ["Arrays", "Strings", "Hash maps", "Sorting", "Stacks and queues", "Graphs", "Dynamic programming", "Recursion"],
  Amazon: ["Arrays", "Hash maps", "Trees", "Graphs", "Stacks and queues", "Sliding window", "Dynamic programming", "Sorting"],
  Microsoft: ["Arrays", "Strings", "Trees", "Graphs", "Binary search", "Sorting", "Dynamic programming", "Recursion"],
  Meta: ["Arrays", "Strings", "Hash maps", "Trees", "Graphs", "Two pointers", "Sliding window"],
};

export const QUESTIONS: CodingQuestion[] = seedQuestions.map(
  (question, index) => ({
    ...question,
    track: index % 2 ? "Core patterns" : "Interview foundations",
    companyTracks: Object.entries(COMPANY_PREP_TOPICS)
      .filter(([, topics]) => question.topics.some((topic) => topics.includes(topic)))
      .map(([company]) => company),
  }),
);

export const INTERVIEW_QUESTIONS = [
  {
    id: "behaviour-1",
    category: "HR & behavioural",
    prompt:
      "Tell me about a time you had to learn something quickly to complete a project.",
    framework: "STAR: situation, task, action, result.",
    criteria: ["Specific context", "Your contribution", "Concrete outcome"],
  },
  {
    id: "behaviour-2",
    category: "HR & behavioural",
    prompt: "Describe a disagreement on a team and how you worked through it.",
    framework: "STAR: situation, task, action, result.",
    criteria: ["Respectful listening", "Reasoned decision", "Reflection"],
  },
  {
    id: "technical-1",
    category: "Technical fundamentals",
    prompt:
      "Explain how a hash map handles collisions and when you would choose one.",
    framework: "Define the structure, trade-offs, and a practical example.",
    criteria: ["Hashing", "Collision strategy", "Complexity and use case"],
  },
  {
    id: "technical-2",
    category: "Technical fundamentals",
    prompt: "Compare processes and threads. What changes for shared state?",
    framework: "Start with isolation, then discuss communication and failure.",
    criteria: ["Memory model", "Concurrency", "Trade-offs"],
  },
  {
    id: "project-1",
    category: "Project-based",
    prompt: "Walk through a project decision you would make differently today.",
    framework:
      "Give context, decision constraints, result, and what changed in your approach.",
    criteria: ["Ownership", "Trade-off reasoning", "Learning"],
  },
  {
    id: "project-2",
    category: "Project-based",
    prompt:
      "How would you explain the architecture of your most substantial project?",
    framework:
      "Move from user need to components, data flow, and one trade-off.",
    criteria: ["Clear structure", "Data flow", "Trade-offs"],
  },
  {
    id: "dsa-1",
    category: "Data structures & algorithms",
    prompt: "How would you find a pair in an array that sums to a target?",
    framework: "Clarify constraints, propose a baseline, then improve it.",
    criteria: ["Correctness", "Complexity", "Edge cases"],
  },
  {
    id: "dsa-2",
    category: "Data structures & algorithms",
    prompt: "When is breadth-first search preferable to depth-first search?",
    framework: "Compare traversal order, shortest paths, and memory use.",
    criteria: ["Traversal order", "Use case", "Complexity"],
  },
  {
    id: "frontend-1",
    category: "Frontend development",
    prompt:
      "How do you keep a user interface responsive when a list grows large?",
    framework: "Discuss measurement, rendering cost, and a targeted technique.",
    criteria: ["Diagnosis", "Virtualization or pagination", "Accessibility"],
  },
  {
    id: "frontend-2",
    category: "Frontend development",
    prompt: "What makes a form accessible and resilient?",
    framework: "Cover semantics, errors, keyboard use, and state.",
    criteria: ["Labels", "Error handling", "Keyboard support"],
  },
  {
    id: "backend-1",
    category: "Backend development",
    prompt: "How would you design a rate limit for a public API?",
    framework: "Define limits, state, distribution, and client feedback.",
    criteria: ["Algorithm", "Distributed state", "HTTP feedback"],
  },
  {
    id: "backend-2",
    category: "Backend development",
    prompt: "How would you investigate a slow database query?",
    framework: "Use evidence from plans and metrics before changing schema.",
    criteria: ["Query plan", "Indexes", "Measurement"],
  },
  {
    id: "data-1",
    category: "Data analytics",
    prompt: "A product metric fell after a release. How would you investigate?",
    framework: "Validate measurement, segment data, then form testable causes.",
    criteria: ["Data quality", "Segmentation", "Actionable next step"],
  },
  {
    id: "general-1",
    category: "General software engineering",
    prompt:
      "How do you balance shipping quickly with maintaining code quality?",
    framework: "Explain risk-based trade-offs and how you make debt visible.",
    criteria: ["Risk awareness", "Practical trade-off", "Follow-through"],
  },
];

export const MENTORS = [
  {
    id: "mentor-1",
    name: "Jordan Lee",
    role: "Staff Frontend Engineer",
    stage: "Senior",
    industry: "Developer tools",
    expertise: ["React", "Accessibility", "Design systems"],
    bio: "Sample profile focused on building inclusive interfaces and maintainable component libraries.",
    topics: ["Portfolio review", "Frontend interviews", "Accessibility"],
  },
  {
    id: "mentor-2",
    name: "Samira Patel",
    role: "Data Analyst",
    stage: "Mid-level",
    industry: "Public interest technology",
    expertise: ["SQL", "Analytics", "Storytelling"],
    bio: "Sample profile focused on practical analysis workflows and communicating findings.",
    topics: ["SQL practice", "Analytics portfolio", "Career transitions"],
  },
  {
    id: "mentor-3",
    name: "Alex Morgan",
    role: "Backend Engineer",
    stage: "Senior",
    industry: "E-commerce",
    expertise: ["APIs", "Node.js", "System design"],
    bio: "Sample profile focused on service design and pragmatic backend engineering.",
    topics: ["System design", "Backend interviews", "API reviews"],
  },
  {
    id: "mentor-4",
    name: "Ravi Shah",
    role: "DevOps Engineer",
    stage: "Mid-level",
    industry: "Climate technology",
    expertise: ["Cloud", "Kubernetes", "CI/CD"],
    bio: "Sample profile focused on learning operations fundamentals through hands-on projects.",
    topics: ["Cloud learning path", "Deployment projects", "Operations roles"],
  },
  {
    id: "mentor-5",
    name: "Taylor Kim",
    role: "Software Engineer",
    stage: "Early career",
    industry: "Education technology",
    expertise: ["Algorithms", "Java", "Interview practice"],
    bio: "Sample profile focused on structured early-career preparation and study habits.",
    topics: ["Placement preparation", "DSA practice", "Resume feedback"],
  },
  {
    id: "mentor-6",
    name: "Nia Brooks",
    role: "Data Scientist",
    stage: "Senior",
    industry: "Healthcare research",
    expertise: ["Python", "Experiment design", "Machine learning"],
    bio: "Sample profile focused on responsible modeling and sound experimental practice.",
    topics: ["Data science projects", "ML fundamentals", "Research roles"],
  },
];
