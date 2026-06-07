import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getChapterWithNav } from "@/data/chapters";
import { useProgress } from "@/hooks/use-progress";

export function DocReader() {
  const [, params] = useRoute("/docs/:slug");
  const slug = params?.slug ?? "";
  const { isCompleted, markComplete } = useProgress();

  const doc = slug ? getChapterWithNav(slug) : undefined;
  const completed = slug ? isCompleted(slug) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!slug) {
    return (
      <div className="mx-auto w-full max-w-4xl px-8 py-12 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="space-y-4 mt-12">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto w-full max-w-4xl px-8 py-12">
        <h1 className="text-2xl font-bold">Chapter not found</h1>
        <Link href="/learn" className="text-primary mt-4 inline-block hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-4xl px-8 py-12 pb-32"
    >
      <header className="mb-12 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="uppercase tracking-wider">{doc.category}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {doc.estimatedMinutes} min read
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{doc.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">{doc.description}</p>
      </header>

      <div className="mb-16">
        <MarkdownRenderer content={doc.content} diagrams={doc.diagrams} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t pt-8">
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4">
          <Button
            size="lg"
            variant={completed ? "secondary" : "default"}
            onClick={() => markComplete(slug, !completed)}
            className="gap-2"
            data-testid="mark-complete-btn"
          >
            <CheckCircle2 className="h-5 w-5" />
            {completed ? "Completed" : "Mark as Complete"}
          </Button>
        </div>

        <nav className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4">
          {doc.prevSlug ? (
            <Button variant="outline" asChild>
              <Link href={`/docs/${doc.prevSlug}`} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
          ) : (
            <div className="w-24" />
          )}

          {doc.nextSlug ? (
            <Button variant="outline" asChild>
              <Link href={`/docs/${doc.nextSlug}`} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="w-24" />
          )}
        </nav>
      </div>
    </motion.div>
  );
}
