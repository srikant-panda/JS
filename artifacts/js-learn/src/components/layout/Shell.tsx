import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, BookOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Link, useLocation } from "wouter";

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const isDocsMode = location.startsWith("/docs/");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <Link href="/" className="font-bold text-base text-primary tracking-tight flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          LearnJS
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <Sidebar isMobile onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop floating sidebar — only in docs mode */}
        {isDocsMode && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <main
          className="flex-1 flex flex-col min-h-[100dvh] relative"
          style={isDocsMode ? { paddingLeft: 220 } : undefined}
        >
          {/* Desktop header (non-docs) */}
          {!isDocsMode && (
            <div className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur-sm shrink-0">
              <Link href="/" className="font-bold text-primary tracking-tight flex items-center gap-1.5 text-sm">
                <BookOpen className="h-4 w-4" />
                LearnJS
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/playground" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Code2 className="h-3.5 w-3.5" />
                  Playground
                </Link>
                <ThemeSwitcher />
              </div>
            </div>
          )}

          {/* Docs mode: thin top bar with theme switcher */}
          {isDocsMode && (
            <div className="hidden md:flex items-center justify-end px-6 py-2 border-b border-border/50 bg-background/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <Link href="/playground" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Code2 className="h-3.5 w-3.5" />
                  Playground
                </Link>
                <ThemeSwitcher />
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
