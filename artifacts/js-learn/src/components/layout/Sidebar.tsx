import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, BookOpen, HelpCircle, Code2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChapters } from "@/data/chapters";
import { useProgress } from "@/hooks/use-progress";

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const chapters = getChapters();

export function Sidebar({ isMobile, onNavigate }: SidebarProps) {
  const [location] = useLocation();
  const { isCompleted } = useProgress();

  const groupedChapters = useMemo(() => {
    const groups: Record<string, typeof chapters> = {};
    const sorted = [...chapters].sort((a, b) => a.order - b.order);
    for (const chapter of sorted) {
      if (!groups[chapter.category]) groups[chapter.category] = [];
      groups[chapter.category].push(chapter);
    }
    return groups;
  }, []);

  const handleNav = () => {
    if (isMobile && onNavigate) onNavigate();
  };

  if (isMobile) {
    return (
      <aside className="flex flex-col h-full w-full bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 shrink-0 items-center px-4 border-b border-sidebar-border">
          <Link href="/learn" onClick={handleNav} className="font-bold tracking-tight text-primary text-sm">
            LearnJS
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-3">
            {/* General App Navigation */}
            <div className="space-y-1 mb-4 border-b border-sidebar-border pb-3">
              <Link
                href="/learn"
                onClick={handleNav}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                  location === "/learn"
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Curriculum</span>
              </Link>
              <Link
                href="/practice"
                onClick={handleNav}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                  location === "/practice"
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Practice Arena</span>
              </Link>
              <Link
                href="/playground"
                onClick={handleNav}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                  location === "/playground"
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Playground</span>
              </Link>
            </div>

            {Object.entries(groupedChapters).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 mb-2">
                  {category}
                </h4>
                {items.map((chapter) => {
                  const isActive = location === `/docs/${chapter.slug}`;
                  const done = isCompleted(chapter.slug);
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/docs/${chapter.slug}`}
                      onClick={handleNav}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="truncate">{chapter.title}</span>
                      {done ? (
                        <CheckCircle2 className={cn("h-3 w-3 shrink-0 ml-1", isActive ? "text-primary-foreground/70" : "text-green-500")} />
                      ) : (
                        <Circle className={cn("h-3 w-3 shrink-0 ml-1", isActive ? "text-primary-foreground/40" : "text-sidebar-foreground/20")} />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    );
  }

  /* Floating sidebar for desktop — overlays content */
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex flex-col w-[220px] bg-black/70 backdrop-blur-md border-r border-white/10 text-white"
    >
      <div
        className="flex h-14 shrink-0 items-center px-4 border-b border-white/10"
      >
        <Link href="/learn" className="font-bold tracking-tight text-primary text-sm">
          LearnJS
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-5 px-3">
          {/* General App Navigation */}
          <div className="space-y-0.5 mb-4 border-b border-white/5 pb-3">
            <Link
              href="/learn"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                location === "/learn"
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Curriculum</span>
            </Link>
            <Link
              href="/practice"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                location === "/practice"
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Practice Arena</span>
            </Link>
            <Link
              href="/playground"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                location === "/playground"
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Playground</span>
            </Link>
          </div>

          {Object.entries(groupedChapters).map(([category, items]) => (
            <div key={category} className="space-y-0.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-2 mb-1.5">
                {category}
              </h4>
              {items.map((chapter) => {
                const isActive = location === `/docs/${chapter.slug}`;
                const done = isCompleted(chapter.slug);
                return (
                  <Link
                    key={chapter.slug}
                    href={`/docs/${chapter.slug}`}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors group",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
                    )}
                    data-testid={`sidebar-chapter-${chapter.slug}`}
                  >
                    <span className="truncate leading-snug">{chapter.title}</span>
                    {done ? (
                      <CheckCircle2 className={cn("h-3 w-3 shrink-0 ml-1", isActive ? "text-primary-foreground/70" : "text-green-500")} />
                    ) : (
                      <Circle className={cn("h-3 w-3 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity", isActive ? "opacity-100 text-primary-foreground/30" : "text-white/20")} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
