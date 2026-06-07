import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";

import { Shell } from "@/components/layout/Shell";
import { Landing } from "@/pages/Landing";
import { Home } from "@/pages/Home";
import { DocReader } from "@/pages/DocReader";
import { Progress } from "@/pages/Progress";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const [location] = useLocation();
  const isLanding = location === "/";

  if (isLanding) {
    return <Landing />;
  }

  return (
    <Shell>
      <Switch>
        <Route path="/learn" component={Home} />
        <Route path="/progress" component={Progress} />
        <Route path="/docs/:slug" component={DocReader} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
