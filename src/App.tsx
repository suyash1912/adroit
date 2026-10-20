import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Pause,
  Palette,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  DEFAULT_DATA,
  INTERVIEW_QUESTIONS,
  MENTORS,
  QUESTIONS,
  ROLES,
  THEMES,
  type AdroitTheme,
  type AppData,
  type CodingAttempt,
  type InterviewSession,
  type MentorNote,
  type ResumeAnalysis,
} from "./domain";
import { extractPdfText, matchRole } from "./resume";
import { buildLearningPlan, type LearningItem } from "./learning";
import { createDemoData } from "./demo";
import {
  clearData,
  exportData,
  exportRecoveryCopies,
  loadData,
  recoveryCopyCount,
  saveData,
} from "./storage";
import { runCases, type CaseResult } from "./runner";

type ContextValue = {
  data: AppData;
  setData: Dispatch<SetStateAction<AppData>>;
  notice: (text: string) => void;
  demoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  resetDemo: () => void;
};
const DataContext = createContext<ContextValue | null>(null);
function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("Missing app data context");
  return value;
}
const id = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
function clearDemoDrafts(): boolean {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("adroit.demo.draft.")) sessionStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}
const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/learning-plan", label: "Learning plan", icon: ClipboardCheck },
  { to: "/resume", label: "Resume analysis", icon: FileText },
  { to: "/coding", label: "Coding lab", icon: Code2 },
  { to: "/interviews", label: "Mock interviews", icon: MessageSquareText },
  { to: "/connect", label: "Industry connect", icon: BriefcaseBusiness },
  { to: "/progress", label: "Progress", icon: Activity },
];

export default function App() {
  const [initialLoad] = useState(loadData);
  const [realData, setRealData] = useState(initialLoad.data);
  const [demoData, setDemoData] = useState(createDemoData);
  const [demoMode, setDemoMode] = useState(false);
  const data = demoMode ? demoData : realData;
  const [message, setMessage] = useState(initialLoad.warning ?? "");
  const setData = useCallback<Dispatch<SetStateAction<AppData>>>(
    (update) => {
      if (demoMode) setDemoData(update);
      else setRealData(update);
    },
    [demoMode],
  );
  useEffect(() => {
    if (!saveData(realData))
      setMessage(
        "Storage is unavailable or full. Export your data before continuing.",
      );
  }, [realData]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.preferences.theme;
  }, [data.preferences.theme]);
  const notice = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };
  const enterDemo = useCallback(() => {
    clearDemoDrafts();
    setDemoData(createDemoData());
    setDemoMode(true);
  }, []);
  const exitDemo = useCallback(() => {
    setDemoMode(false);
    setDemoData(createDemoData());
    notice(
      clearDemoDrafts()
        ? "Exited demonstration mode. Your local workspace was not changed."
        : "Exited demonstration mode. Browser storage prevented cleanup of a temporary demo draft.",
    );
  }, []);
  const resetDemo = useCallback(() => {
    setDemoData(createDemoData());
    notice(
      clearDemoDrafts()
        ? "Demonstration data reset."
        : "Demo records reset, but browser storage prevented cleanup of a temporary draft.",
    );
  }, []);
  const value = useMemo(
    () => ({ data, setData, notice, demoMode, enterDemo, exitDemo, resetDemo }),
    [data, setData, demoMode, enterDemo, exitDemo, resetDemo],
  );
  return (
    <DataContext.Provider value={value}>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="learning-plan" element={<LearningPlan />} />
          <Route path="resume" element={<Resume />} />
          <Route path="coding" element={<Coding />} />
          <Route path="coding/:questionId" element={<Workspace />} />
          <Route path="interviews" element={<Interviews />} />
          <Route
            path="interviews/session/:sessionId"
            element={<InterviewSession />}
          />
          <Route path="connect" element={<Connect />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </DataContext.Provider>
  );
}

function Shell() {
  const { data, setData, demoMode, resetDemo, exitDemo } = useData();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="shell">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Link className="brand" to="/">
          <span className="brand-mark">a.</span>
          <span>
            adroit<small>CAREER STUDIO</small>
          </span>
        </Link>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="privacy-chip">
            <ShieldCheck size={15} /> Saved on this device
          </div>
          <ThemePicker
            theme={data.preferences.theme}
            onChange={(theme) =>
              setData((current) => ({
                ...current,
                preferences: { ...current.preferences, theme },
              }))
            }
          />
          <NavLink to="/settings" className="nav-item">
            <Settings size={17} /> Settings
          </NavLink>
          <div className="profile">
            <span>A</span>
            <div>
              <b>Local workspace</b>
              <small>No account required</small>
            </div>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <span>
            Career studio <b>/</b>{" "}
            {location.pathname.split("/")[1] || "Overview"}
          </span>
          <Link to="/settings">
            <ShieldCheck size={15} /> Local first
          </Link>
        </header>
        <main className="content">
          {demoMode && (
            <section className="demo-banner" aria-label="Demonstration mode">
              <div>
                <b>DEMONSTRATION MODE</b>
                <p>
                  Synthetic resume data only. Practice records stay isolated
                  and are discarded when you exit.
                </p>
                <nav aria-label="Guided demonstration steps">
                  <Link to="/resume">1. Resume</Link>
                  <Link to={`/coding/${QUESTIONS[0].id}`}>
                    2. Run a coding problem
                  </Link>
                  <Link to="/interviews">3. Mock interview</Link>
                  <Link to="/learning-plan">4. Learning plan</Link>
                </nav>
              </div>
              <div className="demo-actions">
                <button
                  className="button outline"
                  onClick={() => {
                    resetDemo();
                    navigate("/");
                  }}
                >
                  Reset demo
                </button>
                <button
                  className="button dark"
                  onClick={() => {
                    exitDemo();
                    navigate("/");
                  }}
                >
                  Exit demo
                </button>
              </div>
            </section>
          )}
          <Outlet />
        </main>
        <footer className="footer">
          <span>Adroit · Upskill. Practise. Perform. Connect.</span>
          <Link to="/settings">Privacy & data</Link>
        </footer>
      </div>
    </div>
  );
}

function ThemePicker({
  theme,
  onChange,
}: {
  theme: AdroitTheme;
  onChange: (theme: AdroitTheme) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  return (
    <div className="theme-picker">
      <button
        className="theme-picker-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="theme-options"
        onClick={() => setOpen((current) => !current)}
      >
        <Palette size={16} />
        <span>
          <small>APPEARANCE</small>
          <b>{selectedTheme.name}</b>
        </span>
        <span className="theme-swatch-preview" aria-hidden="true">
          {selectedTheme.swatches.map((color) => (
            <i key={color} style={{ backgroundColor: color }} />
          ))}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="theme-picker-options"
          id="theme-options"
          role="group"
          aria-label="Choose appearance theme"
        >
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`theme-choice ${theme === item.id ? "selected" : ""}`}
              aria-pressed={theme === item.id}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              <span className="theme-swatch-preview" aria-hidden="true">
                {item.swatches.map((color) => (
                  <i key={color} style={{ backgroundColor: color }} />
                ))}
              </span>
              <span>
                <b>{item.name}</b>
                <small>{item.description}</small>
              </span>
              {theme === item.id && <Check size={15} aria-label="Selected" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function Title({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {detail && <p className="page-detail">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
function Empty({
  title,
  text,
  icon: Icon = Activity,
}: {
  title: string;
  text: string;
  icon?: typeof Activity;
}) {
  return (
    <div className="empty">
      <Icon size={19} />
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}
function Metric({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Activity;
}) {
  return (
    <div className="metric">
      <span>
        <Icon size={17} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{note}</p>
      </div>
    </div>
  );
}
function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function LearningPlan() {
  const { data, setData, notice } = useData();
  const items = buildLearningPlan(data);
  const completedCount = items.filter((item) => item.completed).length;
  const progress = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0;
  const toggle = (item: LearningItem) =>
    setData((current) => ({
      ...current,
      completedLearningItems: item.completed
        ? current.completedLearningItems.filter((id) => id !== item.id)
        : current.completedLearningItems.includes(item.id)
          ? current.completedLearningItems
          : [...current.completedLearningItems, item.id],
    }));
  return (
    <>
      <Title
        eyebrow="PERSONALIZED PRACTICE"
        title="Your learning plan"
        detail="Transparent recommendations from your selected role and saved activity."
      />
      <div className="panel learning-summary">
        <label>
          Target role
          <select
            value={data.preferences.role}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                preferences: {
                  ...current.preferences,
                  role: event.target.value,
                },
              }))
            }
          >
            <option value="">Choose a role</option>
            {ROLES.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <div className="plan-progress">
          <div>
            <b>Plan progress</b>
            <span>
              {completedCount} of {items.length} completed
            </span>
          </div>
          <div
            className="bar"
            role="progressbar"
            aria-label="Learning plan completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <p className="muted plan-explanation">
        Recommendations are generated locally from your latest role-matched
        resume report, coding attempts, and interview self-ratings. Resume
        keywords are not verified skills, and interview ratings are yours.
      </p>
      <div className="learning-items">
        {items.map((item, index) => (
          <article className="panel learning-item" key={item.id}>
            <span className="learning-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="learning-copy">
              <small className="eyebrow">
                {item.completed ? "COMPLETED" : "NEXT ACTION"}
              </small>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
              <small className="muted">
                <b>Why this recommendation:</b> {item.reason}
              </small>
              <Link className="text-link" to={item.href}>
                Open relevant module <ArrowRight size={14} />
              </Link>
            </div>
            <button
              className={`button ${item.completed ? "outline" : "dark"}`}
              type="button"
              aria-pressed={item.completed}
              onClick={() => {
                toggle(item);
                notice(
                  item.completed
                    ? "Learning-plan item reopened."
                    : "Learning-plan item marked complete.",
                );
              }}
            >
              {item.completed ? "Mark active" : "Mark complete"}
              {item.completed ? <ArrowLeft size={14} /> : <Check size={14} />}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}

function Dashboard() {
  const { data, demoMode, enterDemo } = useData();
  const plan = buildLearningPlan(data);
  const nextItem = plan.find((item) => !item.completed);
  const total = data.attempts.reduce((n, item) => n + item.total, 0);
  const pass = data.attempts.reduce((n, item) => n + item.passed, 0);
  const currentAnalysis = data.preferences.role
    ? data.analyses.find(
        (analysis) => analysis.roleId === data.preferences.role,
      )
    : data.analyses[0];
  const solved = new Set(
    data.attempts
      .filter((item) => item.passed === item.total && item.total > 0)
      .map((item) => item.questionId),
  ).size;
  const next = nextItem
    ? {
        title: nextItem.title,
        copy: nextItem.reason,
        to: nextItem.href,
        cta: "Continue learning plan",
        icon: nextItem.href.startsWith("/coding")
          ? Code2
          : nextItem.href === "/interviews"
            ? MessageSquareText
            : nextItem.href === "/connect"
              ? BriefcaseBusiness
              : nextItem.href === "/settings"
                ? Settings
                : FileText,
      }
    : data.analyses.length === 0
      ? {
          title: "Start with your resume",
          copy: "Compare your experience with a target role to surface specific next steps.",
          to: "/resume",
          cta: "Analyse a resume",
          icon: FileText,
        }
      : !data.attempts.length
        ? {
            title: "Build a practice habit",
            copy: "Try one short coding problem and begin a useful record of your progress.",
            to: "/coding",
            cta: "Browse problems",
            icon: Code2,
          }
        : !data.interviews.some((item) => item.completedAt)
          ? {
              title: "Practise saying it out loud",
              copy: "Use a guided mock interview to organise your thinking under pressure.",
              to: "/interviews",
              cta: "Start a mock interview",
              icon: MessageSquareText,
            }
          : {
              title: "Review your progress",
              copy: "Look across your saved work and choose what to focus on next.",
              to: "/progress",
              cta: "Open progress",
              icon: Activity,
            };
  const NextIcon = next.icon;
  const role = ROLES.find((item) => item.id === data.preferences.role);
  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">YOUR CAREER STUDIO</p>
          <h1>
            Welcome back<span>.</span>
          </h1>
          <p>
            {role
              ? `A little progress toward ${role.name}, one focused session at a time.`
              : "A little focused practice goes a long way. Start wherever you are."}
          </p>
        </div>
        <div className="welcome-mark">
          01
          <small>
            YOUR PACE.
            <br />
            YOUR PLACE.
          </small>
        </div>
      </div>
      <div className="next-step">
        <span>
          <NextIcon size={20} />
        </span>
        <div>
          <small>A GOOD NEXT STEP</small>
          <h2>{next.title}</h2>
          <p>{next.copy}</p>
        </div>
        <div className="next-step-actions">
          <Link className="button dark" to={next.to}>
            {next.cta}
            <ArrowRight size={15} />
          </Link>
          {!demoMode && (
            <button
              className="button outline"
              type="button"
              onClick={enterDemo}
            >
              Explore guided demo
            </button>
          )}
        </div>
      </div>
      <div className="metrics">
        <Metric
          icon={Gauge}
          label="Resume match"
          value={currentAnalysis ? `${currentAnalysis.score}%` : "—"}
          note={
            currentAnalysis?.roleName ??
            (data.preferences.role
              ? "No report for selected role"
              : "No report saved")
          }
        />
        <Metric
          icon={Code2}
          label="Problems solved"
          value={solved}
          note={`${data.attempts.length} attempts recorded`}
        />
        <Metric
          icon={Check}
          label="Test accuracy"
          value={total ? `${Math.round((pass / total) * 100)}%` : "—"}
          note={
            total ? `${pass} of ${total} cases passed` : "No test results yet"
          }
        />
        <Metric
          icon={MessageSquareText}
          label="Interviews"
          value={data.interviews.filter((item) => item.completedAt).length}
          note="Completed sessions"
        />
      </div>
      <Section title="Your practice, in one place">
        <div className="modules">
          {[
            {
              icon: FileText,
              n: "01",
              title: "Resume analysis",
              desc: "Find role-relevant skills and learning priorities.",
              status: data.analyses.length
                ? `${data.analyses.length} saved reports`
                : "Ready when you are",
              to: "/resume",
            },
            {
              icon: Code2,
              n: "02",
              title: "Coding lab",
              desc: "Practise common patterns with local JavaScript tests.",
              status: `${QUESTIONS.length} practice problems`,
              to: "/coding",
            },
            {
              icon: MessageSquareText,
              n: "03",
              title: "Mock interviews",
              desc: "Work through a guided interview and review your answers.",
              status: `${data.interviews.filter((item) => item.completedAt).length} completed`,
              to: "/interviews",
            },
            {
              icon: BriefcaseBusiness,
              n: "04",
              title: "Industry connect",
              desc: "Prepare a focused agenda for a career conversation.",
              status: "Sample directory",
              to: "/connect",
            },
          ].map((item) => (
            <Link className="module" to={item.to} key={item.title}>
              <div>
                <item.icon size={19} />
                <small>{item.n}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <footer>
                {item.status}
                <ArrowRight size={16} />
              </footer>
            </Link>
          ))}
        </div>
      </Section>
      <PlanOverview items={plan} />
      <div className="lower-grid">
        <div className="panel">
          <small className="eyebrow">A SIMPLE START</small>
          <h2>Make this space yours.</h2>
          <p>
            Your work stays in this browser. Begin with any module; real
            activity will shape this overview.
          </p>
          <Link className="text-link" to="/settings">
            Set your preferences <ArrowRight size={14} />
          </Link>
        </div>
        <div className="panel">
          <Section
            title="Recent activity"
            right={
              <Link className="text-link" to="/progress">
                All progress
              </Link>
            }
          >
            {data.attempts.length +
              data.analyses.length +
              data.interviews.filter((item) => item.completedAt).length ===
            0 ? (
              <p className="muted">
                Nothing saved yet. Activity will appear here.
              </p>
            ) : (
              <Recent />
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function PlanOverview({ items }: { items: LearningItem[] }) {
  const nextItems = items.filter((item) => !item.completed).slice(0, 3);
  return (
    <Section
      title="Your learning plan"
      right={
        <Link className="text-link" to="/learning-plan">
          See all steps <ArrowRight size={14} />
        </Link>
      }
    >
      {nextItems.length ? (
        <div className="plan-preview">
          {nextItems.map((item) => (
            <Link key={item.id} to={item.href} className="plan-preview-row">
              <span>
                <b>{item.title}</b>
                <small>{item.reason}</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">
          All current plan steps are marked complete. Choose a new target role
          or revisit the plan as your activity changes.
        </p>
      )}
    </Section>
  );
}
function Recent() {
  const { data } = useData();
  const list = [
    ...data.attempts.map((item) => ({
      date: item.createdAt,
      title:
        QUESTIONS.find((question) => question.id === item.questionId)?.title ??
        "Coding practice",
      detail: `${item.passed}/${item.total} tests passed`,
    })),
    ...data.analyses.map((item) => ({
      date: item.createdAt,
      title: "Resume analysis",
      detail: `${item.score}% · ${item.roleName}`,
    })),
    ...data.interviews
      .filter((item) => item.completedAt)
      .map((item) => ({
        date: item.completedAt!,
        title: "Mock interview",
        detail: item.category,
      })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  return (
    <div>
      {list.map((item) => (
        <div className="recent-row" key={item.date}>
          <span />
          <div>
            <b>{item.title}</b>
            <small>{item.detail}</small>
          </div>
          <time>{date(item.date)}</time>
        </div>
      ))}
    </div>
  );
}

function Resume() {
  const { data, setData, notice } = useData();
  const uploadSequence = useRef(0);
  const [roleId, setRoleId] = useState(data.preferences.role || "frontend");
  const [text, setText] = useState("");
  const [job, setJob] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ReturnType<typeof matchRole> | null>(
    null,
  );
  const [file, setFile] = useState("");
  const analyze = (event: FormEvent) => {
    event.preventDefault();
    if (text.trim().length < 40) {
      setError("Add resume text (at least 40 characters) before analysing.");
      return;
    }
    setError("");
    setResult(matchRole(text, roleId, job));
  };
  const upload = async (picked?: File) => {
    if (!picked) return;
    const currentUpload = ++uploadSequence.current;
    setResult(null);
    setError("");
    setFile(picked.name);
    if (
      !picked.name.toLowerCase().endsWith(".pdf") ||
      (picked.type && picked.type !== "application/pdf")
    ) {
      setError("Select a PDF file, or paste resume text.");
      setBusy(false);
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError("PDFs must be 5 MB or smaller.");
      setBusy(false);
      return;
    }
    setBusy(true);
    setProgress("Starting local PDF extraction...");
    try {
      const extracted = await extractPdfText(picked, (message) => {
        if (currentUpload === uploadSequence.current) setProgress(message);
      });
      if (currentUpload !== uploadSequence.current) return;
      if (!extracted)
        setError(
          "No selectable text found. OCR is unavailable; paste your resume text or use a text-based PDF.",
        );
      else {
        setText(extracted);
        setResult(null);
      }
    } catch (cause) {
      if (currentUpload === uploadSequence.current)
        setError(
          cause instanceof Error ? cause.message : "Could not parse this PDF.",
        );
    } finally {
      if (currentUpload === uploadSequence.current) {
        setBusy(false);
        setProgress("");
      }
    }
  };
  const save = () => {
    if (!result) return;
    const duplicate = data.analyses.some(
      (report) =>
        report.roleId === roleId &&
        report.basis === result.basis &&
        report.score === result.score &&
        report.textExcerpt === text.slice(0, 400) &&
        JSON.stringify(report.matched) === JSON.stringify(result.matched) &&
        JSON.stringify(report.missing) === JSON.stringify(result.missing),
    );
    if (duplicate) {
      notice("This exact analysis is already saved.");
      return;
    }
    const report: ResumeAnalysis = {
      id: id(),
      createdAt: new Date().toISOString(),
      roleId,
      roleName: result.role.name,
      basis: result.basis,
      score: result.score,
      detected: result.detected,
      matched: result.matched,
      missing: result.missing,
      priorities: result.priorities,
      textExcerpt: text.slice(0, 400),
    };
    setData((current) => ({
      ...current,
      analyses: [report, ...current.analyses],
      preferences: { ...current.preferences, role: roleId },
    }));
    notice("Analysis saved on this device. The PDF was not saved.");
  };
  return (
    <>
      <Title
        eyebrow="ROLE READINESS"
        title="Resume analysis"
        detail="An explainable skill comparison, processed in your browser."
      />
      <div className="privacy-banner">
        <ShieldCheck size={17} />
        <span>
          <b>Your resume stays yours.</b> PDF text extraction happens locally.
          The file is not uploaded or retained; save a report only when you
          choose to.
        </span>
      </div>
      <form className="panel form-panel" onSubmit={analyze}>
        <div className="two-cols">
          <label>
            Target role
            <select
              value={roleId}
              onChange={(event) => {
                setRoleId(event.target.value);
                setResult(null);
              }}
            >
              {ROLES.map((role) => (
                <option value={role.id} key={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="upload-label">
            Resume PDF
            <span className="upload-box">
              <Upload size={16} />
              {busy ? "Reading locally…" : file || "Choose PDF · up to 5 MB"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </span>
          </label>
        </div>
        {busy && (
          <p className="muted" role="status" aria-live="polite">
            {progress}
          </p>
        )}
        <label>
          Resume text
          <textarea
            rows={8}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setResult(null);
              setError("");
            }}
            placeholder="Paste resume text here, or extract it from a text-based PDF above."
          />
        </label>
        <label>
          Optional job description
          <textarea
            rows={3}
            value={job}
            onChange={(event) => {
              setJob(event.target.value);
              setResult(null);
            }}
            placeholder="Add a job description to include its skills in the comparison."
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-bottom">
          <small>Keyword matching is not a measure of competence.</small>
          <button className="button dark">
            Analyse skills <ArrowRight size={14} />
          </button>
        </div>
      </form>
      {result && (
        <section className="panel report">
          <div className="report-heading">
            <div>
              <small className="eyebrow">YOUR ROLE SNAPSHOT</small>
              <h2>{result.role.name}</h2>
            </div>
            <b className="score">
              {result.score}%<small>weighted match</small>
            </b>
          </div>
          <div className="bar">
            <span style={{ width: `${result.score}%` }} />
          </div>
          <p className="muted">
            {result.basis === "job-description"
              ? "Skills found in the job description become the target list. Core skills in the role profile count twice; other target skills count once. The score is matched target weight ÷ total target weight."
              : "Core role skills count twice; secondary skills once. The score is matched role-skill weight ÷ total role-skill weight."} This reflects resume text overlap, not ability or employability.
          </p>
          {result.basis === "job-description" &&
            result.targetSkills.length === 0 && (
              <p className="error">
                No supported skills were recognized in this job description.
                Add detail or clear it to use the selected role profile.
              </p>
            )}
          <div className="skill-cols">
            <SkillList title="Skills found" skills={result.matched} />
            <SkillList title="Skills not found" skills={result.missing} />
          </div>
          <div className="evidence-list">
            <h3>Resume text evidence</h3>
            {result.matched.filter((skill) => result.evidence[skill]).length ? (
              result.matched
                .filter((skill) => result.evidence[skill])
                .map((skill) => (
                  <p key={skill}>
                    <b>{skill}:</b> "{result.evidence[skill]}"
                  </p>
                ))
            ) : (
              <small className="muted">
                No direct text snippets were found for the matched target skills.
              </small>
            )}
          </div>
          <h3>Suggested preparation topics</h3>
          <div className="tags">
            {result.priorities.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
          <div className="form-bottom">
            <button
              className="button outline"
              onClick={() =>
                downloadText(
                  "adroit-report.txt",
                  `${result.role.name}\nBasis: ${result.basis === "job-description" ? "Job description" : "Role profile"}\nWeighted match: ${result.score}%\nDetected: ${result.detected.join(", ")}\nMatched: ${result.matched.join(", ")}\nMissing: ${result.missing.join(", ")}\nEvidence:\n${result.matched.map((skill) => `- ${skill}: ${result.evidence[skill] ?? "No direct text snippet found"}`).join("\n")}\nSuggested topics: ${result.priorities.join(", ")}\n\nThis is resume-text overlap, not a measure of ability or employability.`,
                  "text/plain",
                )
              }
            >
              <Download size={14} /> Export report
            </button>
            <button className="button dark" onClick={save}>
              Save locally <Check size={14} />
            </button>
          </div>
        </section>
      )}
      <Section title="Saved analyses">
        {data.analyses.length ? (
          data.analyses.map((item) => (
            <div className="saved-row" key={item.id}>
              <b className="saved-score">{item.score}%</b>
              <div>
                <strong>{item.roleName}</strong>
                <small>
                  {date(item.createdAt)} · {item.matched.length} matching skills
                  · {item.basis === "job-description" ? "job description" : "role profile"}
                </small>
              </div>
              <button
                className="icon-button"
                aria-label="Delete analysis"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    analyses: current.analyses.filter(
                      (report) => report.id !== item.id,
                    ),
                  }))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p className="muted">
            Reports appear here after you choose to save them.
          </p>
        )}
      </Section>
    </>
  );
}
function SkillList({ title, skills }: { title: string; skills: string[] }) {
  return (
    <div>
      <h3>
        {title} <span className="count">{skills.length}</span>
      </h3>
      {skills.length ? (
        <div className="skill-items">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      ) : (
        <small className="muted">None detected.</small>
      )}
    </div>
  );
}

function Coding() {
  const { data } = useData();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [topic, setTopic] = useState("All topics");
  const [company, setCompany] = useState("All prep tracks");
  const [completion, setCompletion] = useState("All problems");
  const [sort, setSort] = useState("Default order");
  const topics = [
    ...new Set(QUESTIONS.flatMap((question) => question.topics)),
  ].sort();
  const companies = [
    ...new Set(QUESTIONS.flatMap((question) => question.companyTracks)),
  ].sort();
  const completed = new Set(
    data.attempts
      .filter((item) => item.passed === item.total && item.total > 0)
      .map((item) => item.questionId),
  );
  const questions = QUESTIONS.filter(
    (item) =>
      `${item.title} ${item.topics.join(" ")} ${item.companyTracks.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (level === "All" || item.difficulty === level) &&
      (topic === "All topics" || item.topics.includes(topic)) &&
      (company === "All prep tracks" || item.companyTracks.includes(company)) &&
      (completion === "All problems" ||
        (completion === "Completed"
          ? completed.has(item.id)
          : !completed.has(item.id))),
  ).sort((left, right) => {
    if (sort === "Title A–Z") return left.title.localeCompare(right.title);
    if (sort === "Difficulty")
      return (
        ["Easy", "Medium", "Hard"].indexOf(left.difficulty) -
        ["Easy", "Medium", "Hard"].indexOf(right.difficulty)
      );
    return QUESTIONS.indexOf(left) - QUESTIONS.indexOf(right);
  });
  return (
    <>
      <Title
        eyebrow="CODING LAB"
        title="Practice with purpose."
        detail="Original practice problems organized into company-oriented study tracks. Tags do not verify historical interview questions."
        action={
          <Link className="button dark" to={`/coding/${QUESTIONS[0].id}`}>
            <Play size={14} /> Start practising
          </Link>
        }
      />
      <div className="coding-info">
        <span>
          <b>{QUESTIONS.length}</b> practice problems
        </span>
        <span>
          <b>{completed.size}</b> completed
        </span>
        <span>
          <b>JavaScript</b> runnable language
        </span>
        <p>
          Submissions run in a short-lived sandboxed browser frame. Other
          languages and remote judging are not enabled.
        </p>
      </div>
      <p className="track-disclaimer">
        Company labels are preparation playlists grouped by shared topics, not
        verified claims that a company asked this exact question or endorsements.
      </p>
      <div className="filters">
        <label className="search">
          <Search size={15} />
          <input
            aria-label="Search problems"
            placeholder="Search title or topic"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Difficulty"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select
          aria-label="Topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        >
          <option>All topics</option>
          {topics.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Company preparation track"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        >
          <option>All prep tracks</option>
          {companies.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Completion"
          value={completion}
          onChange={(event) => setCompletion(event.target.value)}
        >
          <option>All problems</option>
          <option>Completed</option>
          <option>Not completed</option>
        </select>
        <select
          aria-label="Sort problems"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option>Default order</option>
          <option>Title A–Z</option>
          <option>Difficulty</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Topics</th>
              <th>Prep tracks</th>
              <th>Difficulty</th>
              <th>Progress</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question.id}>
                <td>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <Link to={`/coding/${question.id}`}>{question.title}</Link>
                </td>
                <td>{question.topics.slice(0, 2).join(" · ")}</td>
                <td>
                  <div className="prep-track-tags">
                    {question.companyTracks.slice(0, 3).map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`difficulty ${question.difficulty.toLowerCase()}`}
                  >
                    {question.difficulty}
                  </span>
                </td>
                <td>
                  {completed.has(question.id) ? "Completed" : "Not started"}
                </td>
                <td>
                  <Link to={`/coding/${question.id}`}>
                    <ArrowRight size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!questions.length && (
          <Empty
            title="No problems match"
            text="Change your search or filters."
            icon={Search}
          />
        )}
      </div>
    </>
  );
}

function Workspace() {
  const { questionId = "" } = useParams();
  const { setData, notice, demoMode } = useData();
  const question = QUESTIONS.find((item) => item.id === questionId);
  const [code, setCode] = useState("");
  const [draftReadyFor, setDraftReadyFor] = useState("");
  const [result, setResult] = useState<CaseResult[] | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const executionId = useRef(0);
  const codeRevision = useRef(0);
  useEffect(() => {
    if (!question) return;
    executionId.current += 1;
    codeRevision.current += 1;
    let savedDraft = "";
    try {
      savedDraft = (demoMode ? sessionStorage : localStorage).getItem(
        `${demoMode ? "adroit.demo.draft." : "adroit.draft."}${question.id}`,
      ) ?? "";
    } catch {
      savedDraft = "";
    }
    setCode(savedDraft || question.starter);
    setDraftReadyFor(question.id);
    setResult(null);
    setError("");
    setRunning(false);
    setHint(0);
    setShowSolution(false);
    setTime(0);
    setTimerOn(false);
  }, [question, demoMode]);
  useEffect(() => {
    if (question && draftReadyFor === question.id && code.length < 50000)
      try {
        (demoMode ? sessionStorage : localStorage).setItem(
          `${demoMode ? "adroit.demo.draft." : "adroit.draft."}${question.id}`,
          code,
        );
      } catch {
        /* Draft storage is optional. */
      }
  }, [code, draftReadyFor, question, demoMode]);
  useEffect(() => {
    if (!timerOn) return;
    const timer = window.setInterval(() => setTime((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timerOn]);
  if (!question) return <NotFound />;
  const execute = async (submit: boolean) => {
    const currentExecution = ++executionId.current;
    const currentRevision = codeRevision.current;
    const elapsedSeconds = time;
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const cases = await runCases(code, question.tests);
      if (
        currentExecution !== executionId.current ||
        currentRevision !== codeRevision.current
      ) {
        setError("Your solution changed while tests were running. Run them again.");
        return;
      }
      setResult(cases);
      if (submit) {
        const attempt: CodingAttempt = {
          id: id(),
          questionId: question.id,
          passed: cases.filter((item) => item.passed).length,
          total: cases.length,
          createdAt: new Date().toISOString(),
          durationSeconds: elapsedSeconds,
        };
        setData((current) => ({
          ...current,
          attempts: [attempt, ...current.attempts],
        }));
        notice(
          attempt.passed === attempt.total
            ? "All tests passed. Attempt saved locally."
            : "Submission recorded. Review failed cases.",
        );
      }
    } catch (cause) {
      if (currentExecution !== executionId.current) return;
      if (currentRevision !== codeRevision.current) {
        setError("Your solution changed while tests were running. Run them again.");
        return;
      }
      setError(cause instanceof Error ? cause.message : "Runner failed");
      if (submit)
        setData((current) => ({
          ...current,
          attempts: [
            {
              id: id(),
              questionId: question.id,
              passed: 0,
              total: question.tests.length,
              createdAt: new Date().toISOString(),
              durationSeconds: elapsedSeconds,
            },
            ...current.attempts,
          ],
        }));
    } finally {
      if (currentExecution === executionId.current) setRunning(false);
    }
  };
  return (
    <>
      <div className="workspace-head">
        <Link to="/coding">
          <ArrowLeft size={14} /> Problem library
        </Link>
        <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
          {question.difficulty}
        </span>
        <button
          className="button outline"
          onClick={() => {
            setTimerOn((value) => !value);
          }}
        >
          <Timer size={14} />{" "}
          {timerOn
            ? `Pause · ${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
            : time
              ? `Resume · ${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
              : "Start timer"}
        </button>
      </div>
      <div className="workspace">
        <section className="problem-panel">
          <h1>{question.title}</h1>
          <div className="tags">
            {question.topics.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="prep-track-block">
            <small>COMPANY-ORIENTED PREP · NOT HISTORICAL ATTRIBUTION</small>
            <div className="prep-track-tags">
              {question.companyTracks.map((item) => (
                <span key={item}>{item} prep</span>
              ))}
            </div>
          </div>
          <p>{question.statement}</p>
          <h3>Input</h3>
          <p>{question.inputDescription}</p>
          <h3>Output</h3>
          <p>{question.outputDescription}</p>
          <h3>Constraints</h3>
          <ul>
            {question.constraints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Examples</h3>
          {question.tests.slice(0, 2).map((test, index) => (
            <pre key={index}>
              Input: {JSON.stringify(test.input)}
              <br />
              Output: {JSON.stringify(test.expected)}
            </pre>
          ))}
          <button
            className="text-link"
            onClick={() => setHint((value) => Math.min(2, value + 1))}
          >
            <Sparkles size={14} /> Reveal hint ({hint}/2)
          </button>
          {hint > 0 && <p>{question.hints.slice(0, hint).join(" ")}</p>}
          <button
            className="text-link"
            onClick={() => setShowSolution((value) => !value)}
          >
            {showSolution ? "Hide" : "Show"} reference solution
          </button>
          {showSolution && (
            <>
              <pre>{question.solution}</pre>
              <small>{question.complexity}</small>
            </>
          )}
        </section>
        <section className="editor-panel">
          <div className="editor-head">
            <span>JavaScript · function solve(input)</span>
            <button
              className="text-link"
              onClick={() => {
                codeRevision.current += 1;
                setResult(null);
                setError("");
                setCode(question.starter);
              }}
            >
              Reset starter
            </button>
          </div>
          <textarea
            className="code"
            aria-label="JavaScript solution editor"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              codeRevision.current += 1;
              setResult(null);
              setError("");
              setCode(event.target.value);
            }}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="form-bottom">
            <small>Sandboxed · 1.8s limit</small>
            <button
              className="button outline"
              disabled={running}
              onClick={() => void execute(false)}
            >
              {running ? "Running…" : "Run tests"}
            </button>
            <button
              className="button dark"
              disabled={running}
              onClick={() => void execute(true)}
            >
              <Play size={13} /> Submit
            </button>
          </div>
          {result && (
            <div className="results">
              <b>
                {result.filter((item) => item.passed).length} / {result.length}{" "}
                passed
              </b>
              {result.map((item, index) => (
                <p key={index} className={item.passed ? "pass" : "fail"}>
                  {item.passed ? <Check size={14} /> : <X size={14} />} Case{" "}
                  {index + 1}
                  {!item.passed && (
                    <small>
                      {item.error ??
                        `Expected ${JSON.stringify(item.expected)}, got ${JSON.stringify(item.actual)}`}
                    </small>
                  )}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
      <p className="sandbox-note">
        <ShieldCheck size={14} /> Opaque-origin sandbox with network access
        blocked and a hard timeout. Not a security boundary for sensitive code.
      </p>
    </>
  );
}

function Interviews() {
  const { data, setData } = useData();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("HR & behavioural");
  const [roleId, setRoleId] = useState(data.preferences.role || ROLES[0].id);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState(5);
  const categories = [
    ...new Set(INTERVIEW_QUESTIONS.map((item) => item.category)),
  ];
  const requestedFocus = searchParams.get("focus");
  const requestedRole = searchParams.get("role");
  useEffect(() => {
    if (
      requestedFocus &&
      INTERVIEW_QUESTIONS.some((item) => item.category === requestedFocus)
    )
      setCategory(requestedFocus);
    if (requestedRole && ROLES.some((item) => item.id === requestedRole))
      setRoleId(requestedRole);
  }, [requestedFocus, requestedRole]);
  const navigate = useNavigate();
  const start = () => {
    const available = INTERVIEW_QUESTIONS.filter(
      (item) => item.category === category,
    );
    const selected = [
      ...available,
      ...INTERVIEW_QUESTIONS.filter((item) => item.category !== category),
    ].slice(0, count);
    const session: InterviewSession = {
      id: id(),
      createdAt: new Date().toISOString(),
      role: ROLES.find((item) => item.id === roleId)?.name ?? ROLES[0].name,
      category,
      difficulty,
      durationMinutes: data.preferences.interviewDuration,
      answers: [],
      questionIds: selected.map((item) => item.id),
    };
    setData((current) => ({
      ...current,
      interviews: [session, ...current.interviews],
    }));
    navigate(`/interviews/session/${session.id}`);
  };
  const history = data.interviews.filter((item) => item.completedAt);
  return (
    <>
      <Title
        eyebrow="GUIDED PRACTICE"
        title="Mock interviews"
        detail="A local question bank and a candid self-review. No AI interviewer or automated judgement."
      />
      <div className="interview-setup panel">
        <small className="eyebrow">BUILD YOUR SESSION</small>
        <h2>Practice at your own pace.</h2>
        <p>
          Answer one question at a time, then review your work with a
          transparent self-assessment rubric.
        </p>
        <label>
          Target role
          <select
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
          >
            {ROLES.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Interview focus
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option>Foundation</option>
            <option>Intermediate</option>
            <option>Stretch</option>
          </select>
        </label>
        <label>
          Questions
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          >
            <option value="3">3 questions</option>
            <option value="5">5 questions</option>
            <option value="8">8 questions</option>
          </select>
        </label>
        <button className="button dark" onClick={start}>
          Start a practice session <ArrowRight size={15} />
        </button>
        <small className="muted">
          {data.preferences.interviewDuration} minute suggested duration.
          Session drafts save locally.
        </small>
      </div>
      <Section title="Interview history">
        {history.length ? (
          history.map((session) => (
            <InterviewRow key={session.id} session={session} />
          ))
        ) : (
          <Empty
            title="No completed sessions"
            text="Your session summaries appear after a practice round."
            icon={MessageSquareText}
          />
        )}
      </Section>
    </>
  );
}
function InterviewRow({ session }: { session: InterviewSession }) {
  const { setData } = useData();
  return (
    <div className="saved-row">
      <span className="history-icon">
        <MessageSquareText size={16} />
      </span>
      <div>
        <strong>{session.category}</strong>
        <small>
          {date(session.completedAt ?? session.createdAt)} ·{" "}
          {session.answers.filter((answer) => answer.answer.trim()).length}/
          {session.questionIds.length} answered
        </small>
      </div>
      <Link to={`/interviews/session/${session.id}`} className="button outline">
        Review
      </Link>
      <button
        className="icon-button"
        aria-label="Delete session"
        onClick={() =>
          setData((current) => ({
            ...current,
            interviews: current.interviews.filter(
              (item) => item.id !== session.id,
            ),
          }))
        }
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
function InterviewSession() {
  const { sessionId = "" } = useParams();
  const { data, setData, notice } = useData();
  const session = data.interviews.find((item) => item.id === sessionId);
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Text guidance is always available.");
  const voiceAvailable =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";
  useEffect(() => {
    setIndex(0);
    setElapsed(0);
    setTimerPaused(false);
    setVoiceEnabled(false);
    setVoiceStatus("Text guidance is always available.");
  }, [sessionId]);
  useEffect(() => {
    if (!session || session.completedAt || timerPaused) return;
    const timer = window.setInterval(
      () => setElapsed((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [session?.completedAt, sessionId, timerPaused]);
  useEffect(
    () => () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [sessionId],
  );
  if (!session) return <NotFound />;
  const questions = session.questionIds
    .map((qid) => INTERVIEW_QUESTIONS.find((item) => item.id === qid))
    .filter((item): item is (typeof INTERVIEW_QUESTIONS)[number] =>
      Boolean(item),
    );
  if (!questions.length) return <NotFound />;
  const question = questions[index] ?? questions[0];
  const response = session.answers.find(
    (answer) => answer.questionId === question.id,
  );
  const speak = (text: string) => {
    if (!voiceAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1.04;
    utterance.onstart = () => setVoiceStatus("Kilo is speaking");
    utterance.onend = () => setVoiceStatus("Kilo is ready when you are");
    utterance.onerror = () =>
      setVoiceStatus("Voice playback could not start. The text guide is here.");
    window.speechSynthesis.speak(utterance);
  };
  const speakQuestion = (questionIndex: number) => {
    const target = questions[questionIndex];
    if (!target) return;
    speak(
      `Question ${questionIndex + 1}. ${target.prompt}. Take two slow breaths. Focus on what the question is asking, then answer in your own words. There is no need to rush.`,
    );
  };
  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setVoiceEnabled(false);
      setVoiceStatus("Voice is off. Text guidance remains available.");
      return;
    }
    setVoiceEnabled(true);
    speak(
      `Hi, I'm Kilo. Before we begin, take a slow breath in, and let it go. One more easy breath. Focus on the question in front of you. You do not need a perfect answer. Start with what you know, take your time, and trust your preparation. ${question.prompt}`,
    );
  };
  const moveToQuestion = (nextIndex: number) => {
    setIndex(nextIndex);
    if (voiceEnabled) speakQuestion(nextIndex);
  };
  const update = (patch: { answer?: string; selfScore?: number }) =>
    setData((current) => ({
      ...current,
      interviews: current.interviews.map((item) =>
        item.id !== session.id
          ? item
          : {
              ...item,
              answers: item.answers.some(
                (answer) => answer.questionId === question.id,
              )
                ? item.answers.map((answer) =>
                    answer.questionId === question.id
                      ? { ...answer, ...patch }
                      : answer,
                  )
                : [
                    ...item.answers,
                    { questionId: question.id, answer: "", ...patch },
                  ],
            },
      ),
    }));
  const finish = () => {
    if (
      !session.completedAt &&
      !window.confirm("Finish this session and open the review?")
    )
      return;
    if (voiceEnabled)
      speak("You showed up and worked through the questions. Take a breath and give yourself credit for the practice. Your review is ready.");
    setData((current) => ({
      ...current,
      interviews: current.interviews.map((item) =>
        item.id === session.id
          ? {
              ...item,
              completedAt: item.completedAt ?? new Date().toISOString(),
            }
          : item,
      ),
    }));
    notice("Session review saved locally.");
  };
  if (session.completedAt)
    return (
      <>
        <Title
          eyebrow="SESSION REVIEW"
          title="Your reflection"
          detail={`${session.category} · ${date(session.completedAt)}`}
          action={
            <Link to="/interviews" className="button outline">
              Interview hub
            </Link>
          }
        />
        <div className="review-note">
          Ratings are your own reflection, not AI-generated evaluations or
          measures of ability.
        </div>
        {questions.map((item, index) => {
          const answer = session.answers.find(
            (entry) => entry.questionId === item.id,
          );
          return (
            <article className="panel review-item" key={item.id}>
              <small>
                QUESTION {index + 1} ·{" "}
                {answer?.answer.trim() ? "ANSWERED" : "UNANSWERED"}
              </small>
              <h2>{item.prompt}</h2>
              <p>{answer?.answer || "No answer saved."}</p>
              <p className="muted">Consider: {item.criteria.join(" · ")}</p>
              <label>
                Self-rating
                <select
                  value={answer?.selfScore ?? ""}
                  onChange={(event) => {
                    updateForSession(
                      setData,
                      session.id,
                      item.id,
                      Number(event.target.value),
                    );
                    notice("Self-rating saved.");
                  }}
                >
                  <option value="" disabled>
                    Not rated
                  </option>
                  <option value="1">1 · Revisit</option>
                  <option value="2">2 · Developing</option>
                  <option value="3">3 · Solid</option>
                  <option value="4">4 · Clear</option>
                </select>
              </label>
            </article>
          );
        })}
      </>
    );
  return (
    <>
      <Link className="back-link" to="/interviews">
        <ArrowLeft size={14} /> Interview setup
      </Link>
      <div className="session-title">
        <div>
          <small className="eyebrow">
            ANSWERING · {session.category.toUpperCase()}
          </small>
          <h1>Take a breath. Then begin.</h1>
        </div>
        <div className="session-timer">
          <b>
            <Timer size={16} />
            <time>
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </time>
          </b>
          <small>Suggested target: {session.durationMinutes} minutes</small>
          <div>
            <button
              className="button outline"
              type="button"
              aria-label={
                timerPaused ? "Resume interview timer" : "Pause interview timer"
              }
              onClick={() => setTimerPaused((paused) => !paused)}
            >
              {timerPaused ? <Play size={13} /> : <Pause size={13} />}
              {timerPaused ? "Resume timer" : "Pause timer"}
            </button>
            <button
              className="button outline"
              type="button"
              aria-label="Reset interview timer"
              onClick={() => {
                setElapsed(0);
                setTimerPaused(true);
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>
      <section className="kilo-coach" aria-label="Kilo interview coach">
        <div className="kilo-mark" aria-hidden="true">
          <Sparkles size={19} />
        </div>
        <div className="kilo-copy">
          <div className="kilo-heading">
            <strong>Kilo</strong>
            <span>YOUR PRACTICE COACH</span>
          </div>
          <p>
            Take two slow breaths. Focus on what the question is asking, then
            answer in your own words. There is no need to rush.
          </p>
          <small aria-live="polite">{voiceStatus}</small>
        </div>
        <div className="kilo-actions">
          {voiceAvailable ? (
            <>
              <button
                className={`button ${voiceEnabled ? "kilo-muted" : "dark"}`}
                type="button"
                aria-pressed={voiceEnabled}
                onClick={toggleVoice}
              >
                {voiceEnabled ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {voiceEnabled ? "Mute Kilo" : "Enable Kilo voice"}
              </button>
              <button
                className="button outline"
                type="button"
                disabled={!voiceEnabled}
                onClick={() => speakQuestion(index)}
              >
                <Volume2 size={14} /> Hear question
              </button>
            </>
          ) : (
            <span className="kilo-unavailable">
              Voice output isn’t supported here. The written guide is available.
            </span>
          )}
        </div>
      </section>
      <p className="kilo-privacy">
        Browser speech output only; Kilo does not listen or use your microphone.
        Voice availability and playback vary by browser and installed voices.
      </p>
      <div className="bar">
        <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="panel session-card">
        <small>
          QUESTION {index + 1} OF {questions.length}
        </small>
        <h2>{question.prompt}</h2>
        <div className="framework">
          <Sparkles size={14} />
          {question.framework}
        </div>
        <label>
          Your answer
          <textarea
            rows={11}
            value={response?.answer ?? ""}
            onChange={(event) => update({ answer: event.target.value })}
            placeholder="Draft your response here. It saves as you type."
          />
        </label>
        <small className="muted">Draft saved locally as you type.</small>
        <div className="form-bottom">
          <button
            className="button outline"
            disabled={!index}
            onClick={() => moveToQuestion(index - 1)}
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <span>
            {index + 1} / {questions.length}
          </span>
          {index < questions.length - 1 ? (
            <>
              <button
                className="button outline"
                onClick={finish}
              >
                Finish early
              </button>
              <button
                className="button dark"
                onClick={() => moveToQuestion(index + 1)}
              >
                Next question <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <button className="button dark" onClick={finish}>
              Finish & review <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
function updateForSession(
  setData: Dispatch<SetStateAction<AppData>>,
  sessionId: string,
  questionId: string,
  score: number,
) {
  setData((current) => ({
    ...current,
    interviews: current.interviews.map((item) =>
      item.id !== sessionId
        ? item
        : {
            ...item,
            answers: item.answers.some(
              (answer) => answer.questionId === questionId,
            )
              ? item.answers.map((answer) =>
                  answer.questionId === questionId
                    ? { ...answer, selfScore: score }
                    : answer,
                )
              : [...item.answers, { questionId, answer: "", selfScore: score }],
          },
    ),
  }));
}

function Connect() {
  const { data, setData, notice } = useData();
  const [mentorId, setMentorId] = useState(MENTORS[0].id);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All stages");
  const [industry, setIndustry] = useState("All industries");
  const [expertise, setExpertise] = useState("All expertise");
  const [topic, setTopic] = useState("All topics");
  const [goal, setGoal] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState("");
  const [agenda, setAgenda] = useState("");
  const mentor = MENTORS.find((item) => item.id === mentorId)!;
  const saved = data.mentorNotes.find((item) => item.mentorId === mentorId);
  const targetRole = ROLES.find(
    (item) => item.id === data.preferences.role,
  );
  const roleAnalysis = targetRole
    ? data.analyses.find((item) => item.roleId === targetRole.id)
    : undefined;
  const goalContext = goal.trim()
    ? `while working toward ${goal.trim().slice(0, 120)}`
    : `for a ${targetRole?.name ?? "my target"} role`;
  const suggestedQuestions = roleAnalysis?.missing.length
    ? roleAnalysis.missing.slice(0, 3).map(
        (skill) =>
          `What practical project could help me build and demonstrate ${skill} ${goalContext}?`,
      )
    : [
        `Which project would best demonstrate readiness ${goalContext}?`,
        "What should I prioritize next to make progress toward my career goal?",
      ];
  const agendaItems = agenda
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  useEffect(() => {
    setGoal(saved?.goal ?? "");
    setSelectedTopics(saved?.topics ?? []);
    setQuestions(saved?.questions ?? "");
    setAgenda(saved?.agenda ?? "");
  }, [mentorId, saved?.updatedAt]);
  const visible = MENTORS.filter((item) =>
    `${item.name} ${item.role} ${item.expertise.join(" ")} ${item.industry}`
      .toLowerCase()
      .includes(query.toLowerCase()) &&
    (stage === "All stages" || item.stage === stage) &&
    (industry === "All industries" || item.industry === industry) &&
    (expertise === "All expertise" || item.expertise.includes(expertise)) &&
    (topic === "All topics" || item.topics.includes(topic)),
  );
  const save = (event: FormEvent) => {
    event.preventDefault();
    const note: MentorNote = {
      id: saved?.id ?? id(),
      mentorId,
      goal,
      topics: selectedTopics,
      questions,
      agenda,
      updatedAt: new Date().toISOString(),
    };
    setData((current) => ({
      ...current,
      mentorNotes: [
        note,
        ...current.mentorNotes.filter((item) => item.mentorId !== mentorId),
      ],
    }));
    notice(
      "Preparation saved locally; nothing was sent to the sample profile.",
    );
  };
  const moveAgendaItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= agendaItems.length) return;
    const reordered = [...agendaItems];
    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];
    setAgenda(reordered.join("\n"));
  };
  const addSuggestedQuestions = () => {
    const existing = new Set(
      questions
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    );
    const additions = suggestedQuestions.filter((item) => !existing.has(item));
    setQuestions(
      [...questions.split("\n").map((item) => item.trim()).filter(Boolean), ...additions].join(
        "\n",
      ),
    );
    notice(
      additions.length
        ? "Local question suggestions added; edit them to fit your goals."
        : "Your notes already include these suggestions.",
    );
  };
  const copyAgenda = async () => {
    if (!agenda.trim()) {
      notice("Add agenda items before copying.");
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(agenda);
      notice("Agenda copied to the clipboard.");
    } catch {
      notice("Clipboard access is unavailable; select and copy the agenda text.");
    }
  };
  return (
    <>
      <Title
        eyebrow="INDUSTRY CONNECT"
        title="Good conversations start here."
        detail="Browse illustrative sample profiles and prepare a consultation agenda."
      />
      <div className="privacy-banner">
        <BriefcaseBusiness size={16} /> Demonstration directory: identities are
        samples. No availability or verified credentials are represented.
      </div>
      <div className="connect-grid">
        <section>
          <label className="search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, role, expertise"
            />
          </label>
          <div className="mentor-filters">
            <select aria-label="Filter by career stage" value={stage} onChange={(event) => setStage(event.target.value)}>
              <option>All stages</option>
              {[...new Set(MENTORS.map((item) => item.stage))].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by industry" value={industry} onChange={(event) => setIndustry(event.target.value)}>
              <option>All industries</option>
              {[...new Set(MENTORS.map((item) => item.industry))].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by expertise" value={expertise} onChange={(event) => setExpertise(event.target.value)}>
              <option>All expertise</option>
              {[...new Set(MENTORS.flatMap((item) => item.expertise))].sort().map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by consultation topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option>All topics</option>
              {[...new Set(MENTORS.flatMap((item) => item.topics))].sort().map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          {visible.length ? visible.map((item) => (
            <button
              className={`mentor-row ${mentorId === item.id ? "selected" : ""}`}
              key={item.id}
              onClick={() => setMentorId(item.id)}
            >
              <span className="avatar">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span>
                <b>{item.name}</b>
                <small>{item.role}</small>
                <small>
                  {item.stage} · {item.industry}
                </small>
              </span>
              <ArrowRight size={15} />
            </button>
          )) : (
            <Empty
              title="No sample profiles match"
              text="Change or clear one or more filters to see the illustrative directory."
              icon={Search}
            />
          )}
        </section>
        <section className="panel mentor-profile">
          <small className="eyebrow">SAMPLE PROFILE</small>
          <h2>{mentor.name}</h2>
          <p>
            {mentor.role} · {mentor.stage}
          </p>
          <p>{mentor.bio}</p>
          <h3>Expertise</h3>
          <div className="tags">
            {mentor.expertise.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <h3>Possible topics</h3>
          <div className="tags">
            {mentor.topics.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p className="muted">
            No booking link is configured. This project does not book meetings
            or send messages.
          </p>
        </section>
      </div>
      <form className="panel form-panel" onSubmit={save}>
        <small className="eyebrow">PREPARE A CONSULTATION</small>
        <h2>Your agenda, your words.</h2>
        <label>
          Career goal
          <textarea
            rows={2}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="What would you like to make progress on?"
          />
        </label>
        <fieldset className="topic-options">
          <legend>Topics to explore</legend>
          {mentor.topics.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={selectedTopics.includes(item)}
                onChange={(event) => setSelectedTopics((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))}
              />
              {item}
            </label>
          ))}
        </fieldset>
        <label htmlFor="consultation-questions">Questions to bring</label>
        <small className="muted">
          {roleAnalysis?.missing.length
            ? `Suggestions use gaps in your latest ${targetRole?.name} resume analysis.`
            : "Suggestions use your selected role and can be edited before saving."}
        </small>
        <div className="suggested-questions">
          {suggestedQuestions.map((suggestion) => (
            <p key={suggestion}>{suggestion}</p>
          ))}
          <button
            className="button outline"
            type="button"
            onClick={addSuggestedQuestions}
          >
            Add suggestions
          </button>
        </div>
        <textarea
          id="consultation-questions"
          rows={3}
          value={questions}
          onChange={(event) => setQuestions(event.target.value)}
        />
        <label>
          Personal agenda
          <textarea
            rows={3}
            value={agenda}
            onChange={(event) => setAgenda(event.target.value)}
          />
        </label>
        <div className="agenda-tools">
          <b>Agenda order</b>
          <div className="agenda-order">
            {agendaItems.length ? (
              agendaItems.map((item, index) => (
                <div className="agenda-order-row" key={`${index}:${item}`}>
                  <span>{item}</span>
                  <span>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Move agenda item ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => moveAgendaItem(index, -1)}
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={`Move agenda item ${index + 1} down`}
                      disabled={index === agendaItems.length - 1}
                      onClick={() => moveAgendaItem(index, 1)}
                    >
                      <ChevronDown size={15} />
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <small className="muted">
                Add one agenda item per line to reorder your outline.
              </small>
            )}
          </div>
          <div className="agenda-actions">
            <button
              className="button outline"
              type="button"
              disabled={!agenda.trim()}
              onClick={() => void copyAgenda()}
            >
              Copy agenda
            </button>
            <button
              className="button outline"
              type="button"
              disabled={!agenda.trim()}
              onClick={() =>
                downloadText(
                  `adroit-agenda-${mentorId}.txt`,
                  agenda,
                  "text/plain",
                )
              }
            >
              <Download size={14} /> Export agenda
            </button>
          </div>
        </div>
        <div className="form-bottom">
          <small>Saving does not contact this sample profile.</small>
          <button className="button dark">
            Save preparation <Check size={14} />
          </button>
        </div>
      </form>
      <Section title="Saved preparations">
        {data.mentorNotes.length ? (
          data.mentorNotes.map((note) => (
            <div className="saved-row" key={note.id}>
              <div>
                <strong>
                  {MENTORS.find((item) => item.id === note.mentorId)?.name} ·
                  preparation
                </strong>
                <small>{date(note.updatedAt)}</small>
              </div>
              <button
                className="button outline"
                onClick={() => setMentorId(note.mentorId)}
              >
                Edit
              </button>
              <button
                className="icon-button"
                aria-label="Delete note"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    mentorNotes: current.mentorNotes.filter(
                      (item) => item.id !== note.id,
                    ),
                  }))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        ) : (
          <p className="muted">
            Your saved consultation agendas will appear here.
          </p>
        )}
      </Section>
    </>
  );
}

function Progress() {
  const { data, setData } = useData();
  const [period, setPeriod] = useState("all");
  const learningItems = buildLearningPlan(data);
  const completedLearningItems = learningItems.filter(
    (item) => item.completed,
  ).length;
  const recent = (value: string) =>
    period === "all" ||
    Date.now() - new Date(value).getTime() <= Number(period) * 86400000;
  const attempts = data.attempts.filter((item) => recent(item.createdAt));
  const trendAttempts = [...attempts]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-8);
  const interviews = data.interviews.filter(
    (item) => item.completedAt && recent(item.completedAt),
  );
  const reports = data.analyses.filter((item) => recent(item.createdAt));
  const passed = attempts.reduce((sum, item) => sum + item.passed, 0),
    total = attempts.reduce((sum, item) => sum + item.total, 0);
  const topics = new Map<string, { pass: number; total: number }>();
  attempts.forEach((attempt) =>
    QUESTIONS.find(
      (question) => question.id === attempt.questionId,
    )?.topics.forEach((topic) => {
      const count = topics.get(topic) ?? { pass: 0, total: 0 };
      count.pass += attempt.passed;
      count.total += attempt.total;
      topics.set(topic, count);
    }),
  );
  const csv = () => {
    const rows = [
      ["type", "date", "item", "result"],
      ...attempts.map((item) => [
        "coding",
        item.createdAt,
        QUESTIONS.find((q) => q.id === item.questionId)?.title ??
          item.questionId,
        `${item.passed}/${item.total}`,
      ]),
      ...reports.map((item) => [
        "resume",
        item.createdAt,
        item.roleName,
        `${item.score}%`,
      ]),
      ...interviews.map((item) => [
        "interview",
        item.completedAt!,
        item.category,
        `${item.answers.filter((a) => a.answer.trim()).length}/${item.questionIds.length}`,
      ]),
    ];
    downloadText(
      "adroit-progress.csv",
      rows
        .map((row) =>
          row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
        )
        .join("\n"),
      "text/csv",
    );
  };
  return (
    <>
      <Title
        eyebrow="YOUR PRACTICE RECORD"
        title="Progress you can trace."
        detail="Every number comes from records stored in this browser."
        action={
          <>
            <button className="button outline" onClick={csv}>
              <Download size={14} /> CSV
            </button>{" "}
            <button className="button dark" onClick={() => exportData(data)}>
              <ArrowDownToLine size={14} /> JSON
            </button>
          </>
        }
      />
      <div className="period-row">
        <label>
          Time period
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="all">All time</option>
            <option value="30">Past 30 days</option>
            <option value="7">Past 7 days</option>
          </select>
        </label>
        <small>Derived from actual local activity.</small>
      </div>
      <div className="metrics">
        <Metric
          icon={Code2}
          label="Coding attempts"
          value={attempts.length}
          note={`${passed} / ${total} cases passed`}
        />
        <Metric
          icon={MessageSquareText}
          label="Completed interviews"
          value={interviews.length}
          note="Finished sessions"
        />
        <Metric
          icon={FileText}
          label="Resume reports"
          value={reports.length}
          note="Saved comparisons"
        />
        <Metric
          icon={Gauge}
          label="Test accuracy"
          value={total ? `${Math.round((passed / total) * 100)}%` : "—"}
          note={total ? "Passing cases ÷ attempted cases" : "No cases recorded"}
        />
        <Metric
          icon={ClipboardCheck}
          label="Learning plan"
          value={`${completedLearningItems}/${learningItems.length}`}
          note="Steps you marked complete"
        />
      </div>
      <Section title="Accuracy by attempt">
        {trendAttempts.length > 1 ? (
          <>
            <div
              className="accuracy-trend"
              role="list"
              aria-label="Test accuracy by coding attempt"
            >
              {trendAttempts.map((attempt) => {
                const accuracy = Math.round(
                  (attempt.passed / attempt.total) * 100,
                );
                return (
                  <div
                    className="accuracy-point"
                    role="listitem"
                    aria-label={`${date(attempt.createdAt)}: ${attempt.passed} of ${attempt.total} tests passed (${accuracy}%)`}
                    key={attempt.id}
                  >
                    <div className="accuracy-column">
                      <span style={{ height: `${accuracy}%` }} />
                    </div>
                    <b>{accuracy}%</b>
                    <small>{date(attempt.createdAt)}</small>
                  </div>
                );
              })}
            </div>
            <p className="muted">
              Each bar is one actual submitted attempt, ordered by date. This
              shows recorded results; it does not predict future performance.
            </p>
          </>
        ) : (
          <Empty
            title={
              trendAttempts.length
                ? "Trend unavailable"
                : "No accuracy history yet"
            }
            text={
              trendAttempts.length
                ? "A single attempt is not enough to show a change over time."
                : "Submit coding solutions to build a real attempt history."
            }
            icon={Gauge}
          />
        )}
      </Section>
      <div className="lower-grid">
        <section className="panel">
          <Section title="Accuracy by topic">
            {topics.size ? (
              [...topics].map(([topic, count]) => (
                <div className="topic-line" key={topic}>
                  <div>
                    <b>{topic}</b>
                    <small>
                      {count.pass}/{count.total}
                    </small>
                  </div>
                  <div className="bar">
                    <span
                      style={{ width: `${(count.pass / count.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <Empty
                title="No topic data yet"
                text="Submit a coding solution to see real pass rates."
              />
            )}
          </Section>
        </section>
        <section className="panel">
          <Section title="Saved resume reports">
            {reports.length ? (
              reports.map((item) => (
                <div className="saved-row" key={item.id}>
                  <b className="saved-score">{item.score}%</b>
                  <div>
                    <strong>{item.roleName}</strong>
                    <small>{date(item.createdAt)}</small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Delete report"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        analyses: current.analyses.filter(
                          (report) => report.id !== item.id,
                        ),
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="No reports yet"
                text="Saved resume comparisons appear here."
                icon={FileText}
              />
            )}
          </Section>
        </section>
      </div>
      <Section title="Coding attempts">
        {attempts.length ? (
          attempts.map((item) => (
            <div className="saved-row" key={item.id}>
              <b className="attempt-score">
                {item.passed}/{item.total}
              </b>
              <div>
                <strong>
                  {
                    QUESTIONS.find(
                      (question) => question.id === item.questionId,
                    )?.title
                  }
                </strong>
                <small>
                  {date(item.createdAt)} ·{" "}
                  {item.passed === item.total
                    ? "All tests passed"
                    : "Some tests failed"}
                </small>
              </div>
              <Link
                className="button outline"
                to={`/coding/${item.questionId}`}
              >
                Review
              </Link>
              <button
                className="icon-button"
                aria-label="Delete attempt"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    attempts: current.attempts.filter(
                      (attempt) => attempt.id !== item.id,
                    ),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty
            title="No attempts in this period"
            text="Only submitted test results are counted. Opening a problem is not a solve."
            icon={Code2}
          />
        )}
      </Section>
      <Section title="Interview sessions">
        {interviews.length ? (
          interviews.map((session) => (
            <div className="saved-row" key={session.id}>
              <div>
                <strong>{session.category}</strong>
                <small>
                  {date(session.completedAt!)} ·{" "}
                  {session.answers.filter((a) => a.answer.trim()).length}/
                  {session.questionIds.length} answered
                </small>
              </div>
              <Link
                className="button outline"
                to={`/interviews/session/${session.id}`}
              >
                Review
              </Link>
              <button
                className="icon-button"
                aria-label="Delete interview"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    interviews: current.interviews.filter(
                      (item) => item.id !== session.id,
                    ),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <Empty
            title="No interviews in this period"
            text="Completed session records appear here."
            icon={MessageSquareText}
          />
        )}
      </Section>
    </>
  );
}
function downloadText(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function SettingsPage() {
  const { data, setData, notice, demoMode, resetDemo } = useData();
  const update = (
    key: keyof AppData["preferences"],
    value: AppData["preferences"][keyof AppData["preferences"]],
  ) =>
    setData((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  const clear = () => {
    if (demoMode) {
      if (
        window.confirm(
          "Reset demonstration data? Your real local workspace will not be changed.",
        )
      )
        resetDemo();
      return;
    }
    if (
      !window.confirm(
        "Clear all Adroit data from this browser? This removes settings, reports, attempts, interviews, notes, and drafts. This cannot be undone.",
      )
    )
      return;
    try {
      clearData();
      Object.keys(localStorage)
        .filter((key) => key.startsWith("adroit.draft."))
        .forEach((key) => localStorage.removeItem(key));
      setData(structuredClone(DEFAULT_DATA));
      notice("Local Adroit data cleared.");
    } catch (cause) {
      notice(
        cause instanceof Error
          ? cause.message
          : "Browser storage could not be cleared.",
      );
    }
  };
  return (
    <>
      <Title
        eyebrow="PREFERENCES & PRIVACY"
        title="Your space, your settings."
        detail="Preferences are stored in this browser. No account or application server is involved."
      />
      <section className="settings-section">
        <h2>Preferences</h2>
        <p>Changes are saved automatically.</p>
        <div className="settings-grid">
          <label>
            Target role
            <select
              value={data.preferences.role}
              onChange={(event) => update("role", event.target.value)}
            >
              <option value="">Choose a role</option>
              {ROLES.map((role) => (
                <option value={role.id} key={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Coding language
            <select
              value={data.preferences.language}
              onChange={(event) => update("language", event.target.value)}
            >
              <option>JavaScript</option>
              <option disabled>Python · unavailable</option>
              <option disabled>Java · unavailable</option>
            </select>
          </label>
          <label>
            Interview duration
            <select
              value={data.preferences.interviewDuration}
              onChange={(event) =>
                update("interviewDuration", Number(event.target.value))
              }
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
            </select>
          </label>
          <label>
            Appearance
            <select
              value={data.preferences.theme}
              onChange={(event) => {
                const selected = THEMES.find(
                  (theme) => theme.id === event.target.value,
                );
                if (selected) update("theme", selected.id);
              }}
            >
              {THEMES.map((theme) => (
                <option value={theme.id} key={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className="settings-section">
        <h2>Local data</h2>
        <p>
          Browser storage is device-specific and may be cleared by browser
          settings. It is not automatically encrypted.
        </p>
        <div className="data-counts">
          {[
            ["Resume reports", data.analyses.length],
            ["Coding attempts", data.attempts.length],
            ["Interview records", data.interviews.length],
            ["Consultation notes", data.mentorNotes.length],
            ["Plan items completed", data.completedLearningItems.length],
          ].map(([label, count]) => (
            <div key={label}>
              <b>{count}</b>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <ul className="privacy-list">
          <li>
            PDF extraction occurs in the browser; files are not uploaded to an
            Adroit server.
          </li>
          <li>
            Analysis is saved locally only when requested. Original resume files
            are not retained.
          </li>
          <li>Browser storage can be lost if site data is cleared.</li>
          <li>
            Speech recognition is not included. A real external booking link
            would leave this app.
          </li>
        </ul>
        <div className="form-bottom">
          <button className="button outline" onClick={() => exportData(data)}>
            <Download size={14} /> Export all data
          </button>
          {!demoMode && recoveryCopyCount() > 0 && (
            <button
              className="button outline"
              onClick={() =>
                notice(
                  exportRecoveryCopies()
                    ? "Recovery copies exported."
                    : "Recovery copies could not be exported.",
                )
              }
            >
              <Download size={14} /> Export recovery copies (
              {recoveryCopyCount()})
            </button>
          )}
          <button className="button danger" onClick={clear}>
            <Trash2 size={14} />{" "}
            {demoMode ? "Reset demo data" : "Clear local data"}
          </button>
        </div>
      </section>
      <section className="settings-section">
        <h2>Honest limitations</h2>
        <p>
          Adroit does not provide authentication, AI assessment, real mentor
          booking, or a remote code judge. JavaScript practice runs locally
          inside an opaque-origin iframe sandbox with network access blocked and
          a time limit.
        </p>
      </section>
    </>
  );
}
function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404 · WRONG TURN</p>
      <h1>This page isn't here.</h1>
      <p>The address may have changed, or this page may not exist.</p>
      <Link className="button dark" to="/">
        Return to overview <ArrowRight size={14} />
      </Link>
    </div>
  );
}
