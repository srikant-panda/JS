import React from 'react';
import { useGetProgress, useListDocs } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Trophy, BookOpen } from 'lucide-react';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

export function Progress() {
  const { data: progress, isLoading: progressLoading } = useGetProgress();
  const { data: chapters, isLoading: chaptersLoading } = useListDocs();

  if (progressLoading || chaptersLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!progress || !chapters) return null;

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
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Completion</h3>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{Math.round(progress.percentComplete)}%</div>
            <ProgressBar value={progress.percentComplete} className="h-2" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
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
        <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {chapters.map((chapter) => (
              <div key={chapter.slug} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
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
                  {chapter.completed ? 'Review' : 'Start'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
