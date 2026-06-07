import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

interface MermaidDiagramProps {
  chart: string;
  id: string;
  title?: string;
}

export function MermaidDiagram({ chart, id, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--app-font-sans)',
    });

    if (containerRef.current) {
      try {
        mermaid.contentLoaded();
        mermaid.render(`mermaid-${id}`, chart).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        });
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    }
  }, [chart, id, resolvedTheme]);

  return (
    <div className="my-8 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      {title && (
        <div className="border-b bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div 
        ref={containerRef} 
        className="flex min-h-[200px] items-center justify-center overflow-x-auto p-6"
      />
    </div>
  );
}
