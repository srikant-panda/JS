import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, BookOpen, LayoutDashboard } from "lucide-react";
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

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground",
        isMobile ? "h-full w-full" : "fixed inset-y-0 left-0 z-20 w-72"
      )}
    >
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <Link
          href="/learn"
          onClick={handleNav}
          className="flex items-center gap-2 font-bold tracking-tight text-lg text-primary"
        >
          <BookOpen className="h-5 w-5" />
          <span>LearnJS</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-8">
          <div className="space-y-1">
            <Link
              href="/progress"
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                location === "/progress"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70"
              )}
              data-testid="sidebar-progress-link"
            >
              <LayoutDashboard className="h-4 w-4" />
              Progress Dashboard
            </Link>
          </div>

          {Object.entries(groupedChapters).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-3">
                {category}
              </h4>
              <div className="space-y-1">
                {items.map((chapter) => {
                  const isActive = location === `/docs/${chapter.slug}`;
                  const done = isCompleted(chapter.slug);
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/docs/${chapter.slug}`}
                      onClick={handleNav}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium"
                      )}
                      data-testid={`sidebar-chapter-${chapter.slug}`}
                    >
                      <span className="truncate">{chapter.title}</span>
                      {done ? (
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary-foreground" : "text-green-500"
                          )}
                        />
                      ) : (
                        <Circle
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary-foreground/50" : "text-sidebar-foreground/30"
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
