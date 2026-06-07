import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
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
      className="fixed inset-y-0 left-0 z-30 flex flex-col"
      style={{
        width: 220,
        background: "rgba(var(--sidebar-raw, 14 20 35) / 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex h-14 shrink-0 items-center px-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/learn" className="font-bold tracking-tight text-primary text-sm">
          LearnJS
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-5 px-3">
          {Object.entries(groupedChapters).map(([category, items]) => (
            <div key={category} className="space-y-0.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 px-2 mb-1.5">
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
                        ? "bg-primary/90 text-primary-foreground font-medium"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                    )}
                    data-testid={`sidebar-chapter-${chapter.slug}`}
                  >
                    <span className="truncate leading-snug">{chapter.title}</span>
                    {done ? (
                      <CheckCircle2 className={cn("h-3 w-3 shrink-0 ml-1", isActive ? "text-primary-foreground/70" : "text-green-500")} />
                    ) : (
                      <Circle className={cn("h-3 w-3 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity", isActive ? "opacity-100 text-primary-foreground/30" : "text-sidebar-foreground/20")} />
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
