import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Zap, GitBranch, Layers, CheckCircle, Clock, ChevronRight, Play, Code2, Terminal } from "lucide-react";
import { getChapters } from "@/data/chapters";
import { useProgress } from "@/hooks/use-progress";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useEffect, useRef, useState, useCallback } from "react";

/* ── cursor glow ─────────────────────────────────────────── */
const JS_CONCEPTS = [
  "closure", "prototype", "hoisting", "this", "scope",
  "async/await", "callback", "Promise", "event loop", "lexical",
  "typeof", "const", "let", "arrow =>", "spread ...",
  "destructuring", "map()", "filter()", "reduce()", "class",
  "module", "import", "export", "Symbol", "WeakMap",
];

function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [visible, setVisible] = useState(false);
  const [concepts, setConcepts] = useState<{ text: string; angle: number; dist: number; key: number }[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterRef = useRef(0);

  const onMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2000);

    counterRef.current += 1;
    if (counterRef.current % 18 === 0) {
      const pool = [...JS_CONCEPTS].sort(() => Math.random() - 0.5).slice(0, 5);
      setConcepts(
        pool.map((text, i) => ({
          text,
          angle: (i / pool.length) * 360 + Math.random() * 30 - 15,
          dist: 20 + Math.random() * 55,
          key: counterRef.current + i,
        }))
      );
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key="glow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.09) 30%, rgba(255,255,255,0.03) 60%, transparent 75%)",
              border: "1px solid rgba(255,255,255,0.10)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible &&
          concepts.map(({ text, angle, dist, key }) => {
            const rad = (angle * Math.PI) / 180;
            const dx = Math.cos(rad) * dist;
            const dy = Math.sin(rad) * dist;
            return (
              <motion.span
                key={key}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 0.7, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "fixed",
                  left: pos.x + dx,
                  top: pos.y + dy,
                  transform: "translate(-50%, -50%)",
                  fontSize: 11,
                  fontFamily: "var(--app-font-mono)",
                  color: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {text}
              </motion.span>
            );
          })}
      </AnimatePresence>
    </div>
  );
}

/* ── macbook typewriter ──────────────────────────────────── */
const GREET_CODE = `function greet(name) {
  const msg = \`Hello, \${name}!\`;
  console.log(msg);
  return msg;
}

greet("World");`;

function MacBookWindow() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [ran, setRan] = useState(false);
  const [output, setOutput] = useState("");
  const idxRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idxRef.current < GREET_CODE.length) {
        setTyped(GREET_CODE.slice(0, idxRef.current + 1));
        idxRef.current += 1;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const handleRun = () => {
    if (!done) return;
    setRan(true);
    setTimeout(() => setOutput('"Hello, World!"'), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      {/* MacBook frame */}
      <div
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ background: "#252525", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          <span className="ml-2 text-xs text-white/30 font-mono">greet.js</span>
        </div>

        {/* Editor body */}
        <div className="p-5 min-h-[200px] font-mono text-sm leading-6">
          <pre
            className="whitespace-pre-wrap"
            style={{ color: "#c9d1d9" }}
          >
            {colorize(typed)}
            {!done && <span className="animate-pulse text-blue-400">|</span>}
          </pre>
        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1e1e1e" }}
        >
          <span className="text-xs text-white/20 font-mono">JavaScript</span>
          <button
            onClick={handleRun}
            disabled={!done}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: done ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.3)",
              color: done ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: done ? "pointer" : "not-allowed",
            }}
          >
            <Play className="h-3 w-3 fill-current" />
            Run
          </button>
        </div>

        {/* Output */}
        <AnimatePresence>
          {ran && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#111" }}
            >
              <div className="flex items-center gap-2 px-4 py-2">
                <Terminal className="h-3.5 w-3.5 text-white/30" />
                <span className="text-xs text-white/30 font-mono">Output</span>
              </div>
              <div className="px-5 pb-4 font-mono text-sm" style={{ color: "#4ade80" }}>
                <AnimatePresence>
                  {output && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {output}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* simple keyword colorizer */
function colorize(code: string) {
  if (!code) return null;
  const lines = code.split("\n");
  return lines.map((line, li) => {
    const colored = line
      .replace(
        /\b(function|return|const|let|var|if|else|for|while|of|in|new|class|import|export|default|async|await|typeof|null|undefined|true|false)\b/g,
        (m) => `\x00keyword\x01${m}\x02`
      )
      .replace(/(`[^`]*`)/g, (m) => `\x00template\x01${m}\x02`)
      .replace(/(\/\/.*)/g, (m) => `\x00comment\x01${m}\x02`)
      .replace(/(".*?"|'.*?')/g, (m) => `\x00string\x01${m}\x02`)
      .replace(/\b(\w+)(?=\()/g, (m) => `\x00fn\x01${m}\x02`);

    const parts = colored.split(/(\x00\w+\x01[\s\S]*?\x02)/);
    return (
      <span key={li}>
        {parts.map((part, pi) => {
          const match = part.match(/^\x00(\w+)\x01([\s\S]*?)\x02$/);
          if (!match) return <span key={pi}>{part}</span>;
          const [, type, text] = match;
          const colorMap: Record<string, string> = {
            keyword: "#ff7b72",
            template: "#a5d6ff",
            comment: "#8b949e",
            string: "#a5d6ff",
            fn: "#d2a8ff",
          };
          return (
            <span key={pi} style={{ color: colorMap[type] ?? "#c9d1d9" }}>
              {text}
            </span>
          );
        })}
        {li < lines.length - 1 && "\n"}
      </span>
    );
  });
}

/* ── stats balls ─────────────────────────────────────────── */
const STATS = [
  { value: "8", label: "Chapters", color: "#6394ff", shadow: "rgba(99,148,255,0.35)", size: 140 },
  { value: "95+", label: "Minutes", color: "#a78bfa", shadow: "rgba(167,139,250,0.35)", size: 120 },
  { value: "6", label: "Diagrams", color: "#34d399", shadow: "rgba(52,211,153,0.35)", size: 128 },
  { value: "3", label: "Levels", color: "#fb923c", shadow: "rgba(251,146,60,0.35)", size: 112 },
];

function StatsBalls() {
  const [popped, setPopped] = useState<number | null>(null);

  return (
    <section className="py-16 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-4xl mx-auto px-6 flex items-end justify-center gap-6 sm:gap-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            data-testid={`stat-${i}`}
            className="flex flex-col items-center gap-3 cursor-pointer select-none"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              setPopped(i);
              setTimeout(() => setPopped(null), 600);
            }}
          >
            <motion.div
              animate={
                popped === i
                  ? { scale: [1, 1.3, 0.9, 1.08, 1], y: [0, -24, 8, -8, 0] }
                  : { y: [0, -10, 0] }
              }
              transition={
                popped === i
                  ? { duration: 0.6, ease: "easeOut" }
                  : {
                      duration: 2.4 + i * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }
              }
              whileHover={{ scale: 1.12 }}
              style={{
                width: stat.size,
                height: stat.size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 38% 32%, ${stat.color}cc 0%, ${stat.color}88 40%, ${stat.color}44 70%, transparent 100%)`,
                boxShadow: `0 8px 32px ${stat.shadow}, 0 0 0 1px ${stat.color}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Gloss shine */}
              <div
                style={{
                  position: "absolute",
                  top: "14%",
                  left: "22%",
                  width: "38%",
                  height: "22%",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  filter: "blur(3px)",
                  transform: "rotate(-30deg)",
                  pointerEvents: "none",
                }}
              />
              <span className="font-bold relative z-10" style={{ fontSize: stat.size * 0.28, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </span>
            </motion.div>
            <span className="text-xs font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── features ────────────────────────────────────────────── */
const features = [
  { icon: BookOpen, title: "Docs-first learning", description: "Every concept is a crisp, focused chapter — written like documentation you actually want to read." },
  { icon: GitBranch, title: "Interactive diagrams", description: "Scope chains, call stacks, event loops, prototype chains — rendered live so you can see what's really happening." },
  { icon: Zap, title: "Syntax-highlighted code", description: "Every example is copy-able and rendered with full syntax highlighting." },
  { icon: Layers, title: "Structured curriculum", description: "Eight chapters from first principles to advanced patterns, organized by category and difficulty." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const allChapters = getChapters();

/* ── Landing ─────────────────────────────────────────────── */
export function Landing() {
  const { isCompleted } = useProgress();
  const previewChapters = allChapters.slice(0, 5);

  return (
    <div className="min-h-screen text-white" style={{ background: "#000" }}>
      <CursorGlow />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight" style={{ color: "#6394ff" }}>
            <BookOpen className="h-4 w-4" />
            <span>LearnJS</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }} data-testid="nav-curriculum">
              Curriculum
            </Link>
            <Link href="/playground" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
              Playground
            </Link>
            <Link href="/progress" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }} data-testid="nav-progress">
              Progress
            </Link>
            <ThemeSwitcher />
            <Link
              href="/learn"
              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
              style={{ background: "#3b82f6", color: "#fff" }}
              data-testid="nav-start"
            >
              Start Learning
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div
                  custom={0} variants={fadeUp} initial="hidden" animate="visible"
                  className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 mb-8"
                  style={{ background: "rgba(99,148,255,0.12)", border: "1px solid rgba(99,148,255,0.25)", color: "#a5b4fc" }}
                  data-testid="hero-badge"
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#6394ff" }} />
                  8 chapters · Free · No account required
                </motion.div>

                <motion.h1
                  custom={1} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
                  data-testid="hero-headline"
                >
                  Learn JavaScript
                  <br />
                  <span style={{ color: "#6394ff" }}>the right way.</span>
                </motion.h1>

                <motion.p
                  custom={2} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-lg leading-relaxed mb-10 max-w-md"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  data-testid="hero-subtext"
                >
                  A precise, doc-driven course that takes you from first principles through closures, async patterns, and prototypes — with interactive diagrams at every step.
                </motion.p>

                <motion.div
                  custom={3} variants={fadeUp} initial="hidden" animate="visible"
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/docs/what-is-javascript"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
                    style={{ background: "#3b82f6", color: "#fff" }}
                    data-testid="hero-cta-primary"
                  >
                    Start Chapter 1 <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/playground"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
                    data-testid="hero-cta-playground"
                  >
                    <Code2 className="h-4 w-4" />
                    Try Playground
                  </Link>
                </motion.div>
              </div>

              {/* MacBook window */}
              <MacBookWindow />
            </div>
          </div>
        </section>

        {/* Stats balls */}
        <StatsBalls />

        {/* Features */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" data-testid="features-heading">Built for real understanding</h2>
              <p className="max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                Not another syntax tutorial. Every chapter is written to explain the <em>why</em>, not just the <em>what</em>.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="rounded-xl p-6" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                    data-testid={`feature-card-${i}`}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(99,148,255,0.12)" }}>
                      <Icon className="h-4 w-4" style={{ color: "#6394ff" }} />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Curriculum preview */}
        <section className="py-24 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2" data-testid="curriculum-heading">Curriculum</h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>From first principles to advanced patterns.</p>
              </div>
              <Link href="/learn" className="text-sm flex items-center gap-1" style={{ color: "#6394ff" }} data-testid="curriculum-view-all">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </motion.div>
            <div className="space-y-2">
              {previewChapters.map((chapter, i) => (
                <motion.div key={chapter.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Link
                    href={`/docs/${chapter.slug}`}
                    className="group flex items-center justify-between rounded-lg px-5 py-4 transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                    data-testid={`curriculum-item-${chapter.slug}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono w-5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {String(chapter.order).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="font-medium text-sm">{chapter.title}</span>
                        <p className="text-xs mt-0.5 line-clamp-1 max-w-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {chapter.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        <Clock className="h-3 w-3" />{chapter.estimatedMinutes} min
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        chapter.difficulty === "beginner" ? "bg-green-500/10 text-green-400"
                          : chapter.difficulty === "intermediate" ? "bg-blue-500/10 text-blue-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {chapter.difficulty}
                      </span>
                      {isCompleted(chapter.slug) && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "rgba(255,255,255,0.25)" }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl font-bold mb-4" data-testid="cta-heading">Ready to understand JavaScript deeply?</h2>
              <p className="mb-10 text-lg" style={{ color: "rgba(255,255,255,0.45)" }}>
                Start with Chapter 1. No signup. No fluff. Just precise, technical content you can actually learn from.
              </p>
              <Link
                href="/docs/what-is-javascript"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors"
                style={{ background: "#3b82f6", color: "#fff" }}
                data-testid="cta-button"
              >
                Begin Chapter 1 <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          <div className="flex items-center gap-2 font-medium text-white">
            <BookOpen className="h-4 w-4" style={{ color: "#6394ff" }} />
            LearnJS
          </div>
          <div className="flex items-center gap-6">
            <Link href="/learn" className="hover:text-white transition-colors">Curriculum</Link>
            <Link href="/playground" className="hover:text-white transition-colors">Playground</Link>
            <Link href="/progress" className="hover:text-white transition-colors">Progress</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
