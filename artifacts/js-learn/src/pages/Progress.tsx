import { motion } from "framer-motion";
import { CheckCircle2, Flame, Trophy, BookOpen } from "lucide-react";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Link } from "wouter";
import { getChapters } from "@/data/chapters";
import { useProgress } from "@/hooks/use-progress";

const chapters = getChapters();

export function Progress() {
  const progress = useProgress();

  const chaptersWithCompletion = chapters.map((c) => ({
    ...c,
    completed: progress.isCompleted(c.slug),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-12 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-muted-foreground">Track your journey to JavaScript mastery.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
          data-testid="stat-completion"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Completion</h3>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{progress.percentComplete}%</div>
            <ProgressBar value={progress.percentComplete} className="h-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
          data-testid="stat-chapters"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Chapters read</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{progress.completedChapters}</span>
            <span className="text-muted-foreground font-medium">/ {progress.totalChapters}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
          data-testid="stat-streak"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">Current streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{progress.streakDays}</span>
            <span className="text-muted-foreground font-medium">Days</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-semibold tracking-tight">All Chapters</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {chaptersWithCompletion.map((chapter) => (
              <div
                key={chapter.slug}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                data-testid={`progress-row-${chapter.slug}`}
              >
                <div className="flex items-center gap-4">
                  {chapter.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0" />
                  )}
                  <div>
                    <h4 className="font-medium">{chapter.title}</h4>
                    <p className="text-sm text-muted-foreground">{chapter.category}</p>
                  </div>
                </div>
                <Link
                  href={`/docs/${chapter.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {chapter.completed ? "Review" : "Start"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
