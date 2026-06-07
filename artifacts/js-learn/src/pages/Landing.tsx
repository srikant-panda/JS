import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Zap, GitBranch, Layers, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { useListDocs } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: BookOpen,
    title: "Docs-first learning",
    description: "Every concept is a crisp, focused chapter — written like documentation you actually want to read.",
  },
  {
    icon: GitBranch,
    title: "Interactive diagrams",
    description: "Scope chains, call stacks, event loops, prototype chains — rendered live so you can see what's really happening.",
  },
  {
    icon: Zap,
    title: "Syntax-highlighted code",
    description: "Every example is runnable, copy-able, and rendered with full syntax highlighting.",
  },
  {
    icon: Layers,
    title: "Structured curriculum",
    description: "Eight chapters from first principles to advanced patterns, organized by category and difficulty.",
  },
];

const codeSnippet = `// Closures — one of JavaScript's
// most powerful features

function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3`;

export function Landing() {
  const { data: chapters } = useListDocs();
  const previewChapters = chapters?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary tracking-tight">
            <BookOpen className="h-4 w-4" />
            <span>LearnJS</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-curriculum"
            >
              Curriculum
            </Link>
            <Link
              href="/progress"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-progress"
            >
              Progress
            </Link>
            <Link
              href="/learn"
              className="text-sm font-medium px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 text-xs font-medium text-accent-foreground bg-accent/20 border border-accent/30 rounded-full px-3 py-1 mb-8"
                  data-testid="hero-badge"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  8 chapters · Free · No account required
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
                  data-testid="hero-headline"
                >
                  Learn JavaScript
                  <br />
                  <span className="text-primary">the right way.</span>
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md"
                  data-testid="hero-subtext"
                >
                  A precise, doc-driven course that takes you from first principles through closures, async patterns, and prototypes — with interactive diagrams at every step.
                </motion.p>

                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link
                    href="/docs/what-is-javascript"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
                    data-testid="hero-cta-primary"
                  >
                    Start Chapter 1
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm"
                    data-testid="hero-cta-secondary"
                  >
                    Browse curriculum
                  </Link>
                </motion.div>
              </div>

              {/* Code window */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl"
                data-testid="hero-code-window"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">closures.js</span>
                </div>
                <pre className="p-5 text-sm font-mono text-foreground/90 leading-relaxed overflow-x-auto">
                  <code>{codeSnippet}</code>
                </pre>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "8", label: "Chapters" },
              { value: "95+", label: "Minutes of content" },
              { value: "6", label: "Interactive diagrams" },
              { value: "3", label: "Difficulty levels" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                data-testid={`stat-${i}`}
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-4" data-testid="features-heading">
                Built for real understanding
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Not another syntax tutorial. Every chapter is written to explain the <em>why</em>, not just the <em>what</em>.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="rounded-xl border border-border bg-card p-6"
                    data-testid={`feature-card-${i}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Curriculum preview */}
        <section className="py-24 px-6 bg-card/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 flex items-end justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2" data-testid="curriculum-heading">Curriculum</h2>
                <p className="text-muted-foreground">From first principles to advanced patterns.</p>
              </div>
              <Link
                href="/learn"
                className="text-sm text-primary hover:underline flex items-center gap-1"
                data-testid="curriculum-view-all"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </motion.div>

            <div className="space-y-2">
              {previewChapters.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))
                : previewChapters.map((chapter, i) => (
                    <motion.div
                      key={chapter.slug}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`/docs/${chapter.slug}`}
                        className="group flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                        data-testid={`curriculum-item-${chapter.slug}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-muted-foreground w-5">
                            {String(chapter.order).padStart(2, "0")}
                          </span>
                          <div>
                            <span className="font-medium text-sm">{chapter.title}</span>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-sm">
                              {chapter.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {chapter.estimatedMinutes} min
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              chapter.difficulty === "beginner"
                                ? "bg-green-500/10 text-green-500"
                                : chapter.difficulty === "intermediate"
                                ? "bg-accent/20 text-accent-foreground"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {chapter.difficulty}
                          </span>
                          {chapter.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-4" data-testid="cta-heading">
                Ready to understand JavaScript deeply?
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Start with Chapter 1. No signup. No fluff. Just precise, technical content you can actually learn from.
              </p>
              <Link
                href="/docs/what-is-javascript"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                data-testid="cta-button"
              >
                Begin Chapter 1
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            LearnJS
          </div>
          <div className="flex items-center gap-6">
            <Link href="/learn" className="hover:text-foreground transition-colors">Curriculum</Link>
            <Link href="/progress" className="hover:text-foreground transition-colors">Progress</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
