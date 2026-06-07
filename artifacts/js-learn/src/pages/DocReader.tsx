import React, { useEffect, useRef, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { 
  useGetDoc, 
  getGetDocQueryKey, 
  useMarkComplete,
  getGetProgressQueryKey,
  getListDocsQueryKey
} from '@workspace/api-client-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function DocReader() {
  const [match, params] = useRoute('/docs/:slug');
  const slug = params?.slug;
  const queryClient = useQueryClient();

  const { data: doc, isLoading } = useGetDoc(slug || '', {
    query: {
      enabled: !!slug,
      queryKey: getGetDocQueryKey(slug || ''),
    }
  });

  const markCompleteMutation = useMarkComplete();

  const handleMarkComplete = () => {
    if (!slug) return;
    
    // Optimistic update
    queryClient.setQueryData(getGetDocQueryKey(slug), (old: any) => 
      old ? { ...old, completed: true } : old
    );

    markCompleteMutation.mutate({
      slug,
      data: { completed: true }
    }, {
      onSuccess: () => {
        // Invalidate to refresh sidebar and progress
        queryClient.invalidateQueries({ queryKey: getListDocsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
      }
    });
  };

  useEffect(() => {
    // Scroll to top on slug change
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-8 py-12 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4 mt-12">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-64 w-full mt-8" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto w-full max-w-4xl px-8 py-12">
        <h1 className="text-2xl font-bold">Chapter not found</h1>
        <Link href="/" className="text-primary mt-4 inline-block hover:underline">
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
        <p className="text-xl text-muted-foreground leading-relaxed">
          {doc.description}
        </p>
      </header>

      <div className="mb-16">
        <MarkdownRenderer content={doc.content} diagrams={doc.diagrams} />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t pt-8">
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4">
          <Button 
            size="lg"
            variant={doc.completed ? "secondary" : "default"}
            onClick={handleMarkComplete}
            disabled={doc.completed || markCompleteMutation.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            {doc.completed ? 'Completed' : 'Mark as Complete'}
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
            <div className="w-24" /> // spacer
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
