import React from 'react';
import { Link } from 'wouter';
import { useListDocs, useGetProgress } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Flame, Trophy, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Home() {
  const { data: chapters, isLoading: chaptersLoading } = useListDocs();
  const { data: progress, isLoading: progressLoading } = useGetProgress();

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'beginner': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const nextUncompleted = chapters?.find(c => !c.completed);

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Master JavaScript Deeply.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A precise, interactive journey through the core mechanics of JavaScript. 
            No fluff, just deep technical understanding.
          </p>
        </header>

        {(progressLoading || chaptersLoading) ? (
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            {progress && (
              <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Your Learning Journey</h3>
                      <span className="text-sm font-medium text-muted-foreground">{Math.round(progress.percentComplete)}% Complete</span>
                    </div>
                    <Progress value={progress.percentComplete} className="h-2" />
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{progress.completedChapters} / {progress.totalChapters} Chapters</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4" />
                        <span>{progress.streakDays} Day Streak</span>
                      </div>
                    </div>
                  </div>
                  
                  {nextUncompleted && (
                    <div className="shrink-0">
                      <Link 
                        href={`/docs/${nextUncompleted.slug}`}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Continue Learning
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chapters Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chapters?.map((chapter, i) => (
                  <motion.div
                    key={chapter.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/docs/${chapter.slug}`}
                      className={cn(
                        "group flex h-full flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md",
                        chapter.completed && "border-green-500/20 bg-green-500/5"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={getDifficultyColor(chapter.difficulty)}>
                            {chapter.difficulty}
                          </Badge>
                          {chapter.completed && <Trophy className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {chapter.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{chapter.estimatedMinutes} min read</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
