import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Add a nice dark theme for code blocks
import { Diagram } from '@workspace/api-client-react';
import { MermaidDiagram } from './MermaidDiagram';

interface MarkdownRendererProps {
  content: string;
  diagrams?: Diagram[];
}

export function MarkdownRenderer({ content, diagrams = [] }: MarkdownRendererProps) {
  // We'll replace custom placeholders like {{diagram-id}} with actual mermaid components if needed,
  // or just render them at the end. For now, we'll assume the markdown is standard and diagrams
  // are shown either inline (if markdown supports it) or we'll just append them.
  // We'll do a simple append for diagrams if they aren't injected via markdown custom components.

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
          pre: ({ node, ...props }) => <pre className="overflow-x-auto rounded-lg border bg-zinc-950 p-4 shadow-sm" {...props} />,
          code: ({ node, className, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props} />
            ) : (
              <code className={className} {...props} />
            );
          }
        }}
      >
        {content}
      </Markdown>

      {diagrams.length > 0 && (
        <div className="mt-12 space-y-8 border-t pt-8">
          <h3 className="text-xl font-semibold tracking-tight">Interactive Diagrams</h3>
          {diagrams.map((d) => (
            <MermaidDiagram key={d.id} id={d.id} chart={d.data} title={d.title} />
          ))}
        </div>
      )}
    </div>
  );
}
