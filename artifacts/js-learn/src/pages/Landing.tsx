import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Zap, GitBranch, Layers, CheckCircle, Clock, ChevronRight, Play, Code2, Terminal } from "lucide-react";
import { getChapters } from "@/data/chapters";
import { useProgress } from "@/hooks/use-progress";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useCallback } from "react";



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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <section className="py-16 overflow-hidden border-y border-border/55 bg-muted/20">
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
                background: isDark
                  ? `radial-gradient(circle at 38% 32%, ${stat.color}cc 0%, ${stat.color}88 40%, ${stat.color}44 70%, transparent 100%)`
                  : `radial-gradient(circle at 38% 32%, ${stat.color}dd 0%, ${stat.color}aa 40%, ${stat.color}55 70%, transparent 100%)`,
                boxShadow: isDark
                  ? `0 8px 32px ${stat.shadow}, 0 0 0 1px ${stat.color}33, inset 0 1px 0 rgba(255,255,255,0.2)`
                  : `0 8px 24px ${stat.shadow}, 0 0 0 1px ${stat.color}44, inset 0 1px 0 rgba(255,255,255,0.4)`,
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
                  background: isDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.35)",
                  filter: "blur(3px)",
                  transform: "rotate(-30deg)",
                  pointerEvents: "none",
                }}
              />
              <span className="font-bold relative z-10" style={{ fontSize: stat.size * 0.28, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </span>
            </motion.div>
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
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
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const allChapters = getChapters();

/* ── Landing ─────────────────────────────────────────────── */
export function Landing() {
  const { isCompleted } = useProgress();
  const previewChapters = allChapters.slice(0, 5);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const bgStyle = isDark
    ? { background: "radial-gradient(circle at 50% 50%, #0c0f1a 0%, #020305 100%)" }
    : { background: "radial-gradient(circle at 50% 50%, #f1f5f9 0%, #cbd5e1 100%)" };

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300" style={bgStyle}>

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-md text-white transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary">
            <BookOpen className="h-4 w-4" />
            <span>LearnJS</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors" data-testid="nav-curriculum">
              Curriculum
            </Link>
            <Link href="/practice" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Practice
            </Link>
            <Link href="/playground" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Playground
            </Link>
            <Link href="/progress" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors" data-testid="nav-progress">
              Progress
            </Link>
            <ThemeSwitcher />
            <Link
              href="/learn"
              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
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
                  className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 mb-8 bg-primary/10 border border-primary/20 text-primary dark:text-blue-300"
                  data-testid="hero-badge"
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block bg-primary" />
                  8 chapters · Free · No account required
                </motion.div>

                <motion.h1
                  custom={1} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
                  data-testid="hero-headline"
                >
                  Learn JavaScript
                  <br />
                  <span className="text-primary">the right way.</span>
                </motion.h1>

                <motion.p
                  custom={2} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-lg leading-relaxed mb-10 max-w-md text-muted-foreground"
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
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    data-testid="hero-cta-primary"
                  >
                    Start Chapter 1 <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/playground"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors border border-border bg-card/50 hover:bg-accent text-foreground shadow-sm animate-none"
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
              <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="features-heading">Built for real understanding</h2>
              <p className="max-w-md mx-auto text-muted-foreground">
                Not another syntax tutorial. Every chapter is written to explain the <em>why</em>, not just the <em>what</em>.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="rounded-xl p-6 border border-border bg-card/65 backdrop-blur-sm hover:bg-card/85 transition-all shadow-sm"
                    data-testid={`feature-card-${i}`}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Curriculum preview */}
        <section className="py-24 px-6 border-y border-border/50 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-foreground" data-testid="curriculum-heading">Curriculum</h2>
                <p className="text-muted-foreground">From first principles to advanced patterns.</p>
              </div>
              <Link href="/learn" className="text-sm font-semibold flex items-center gap-1 text-primary hover:underline" data-testid="curriculum-view-all">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </motion.div>
            <div className="space-y-2">
              {previewChapters.map((chapter, i) => (
                <motion.div key={chapter.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Link
                    href={`/docs/${chapter.slug}`}
                    className="group flex items-center justify-between rounded-lg px-5 py-4 border border-border bg-card/65 backdrop-blur-sm hover:border-primary/50 hover:shadow-sm hover:bg-card/85 transition-all"
                    data-testid={`curriculum-item-${chapter.slug}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono w-5 text-muted-foreground/40">
                        {String(chapter.order).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{chapter.title}</span>
                        <p className="text-xs mt-0.5 line-clamp-1 max-w-sm text-muted-foreground">
                          {chapter.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground/70">
                        <Clock className="h-3 w-3" />{chapter.estimatedMinutes} min
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        chapter.difficulty === "beginner" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : chapter.difficulty === "intermediate" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {chapter.difficulty}
                      </span>
                      {isCompleted(chapter.slug) && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
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
              <h2 className="text-4xl font-bold mb-4 text-foreground" data-testid="cta-heading">Ready to understand JavaScript deeply?</h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Start with Chapter 1. No signup. No fluff. Just precise, technical content you can actually learn from.
              </p>
              <Link
                href="/docs/what-is-javascript"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                data-testid="cta-button"
              >
                Begin Chapter 1 <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            LearnJS
          </div>
          <div className="flex items-center gap-6">
            <Link href="/learn" className="hover:text-foreground transition-colors">Curriculum</Link>
            <Link href="/practice" className="hover:text-foreground transition-colors">Practice</Link>
            <Link href="/playground" className="hover:text-foreground transition-colors">Playground</Link>
            <Link href="/progress" className="hover:text-foreground transition-colors">Progress</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
