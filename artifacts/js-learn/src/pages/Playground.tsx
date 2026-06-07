import { useState, useRef, useCallback } from "react";
import { Play, Trash2, Terminal, Code2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type OutputLine = { type: "log" | "error" | "warn" | "return" | "info"; text: string };
type Mode = "console" | "ide";

const STARTER = `// Write JavaScript here and click Run
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
console.log([1, 2, 3].map(x => x * 2));
console.log(typeof null);`;

function serializeValue(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "function") return val.toString().split("\n")[0] + " ... }";
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === "object") {
    try { return JSON.stringify(val, null, 2); } catch { return String(val); }
  }
  return String(val);
}

function runCode(code: string): OutputLine[] {
  const lines: OutputLine[] = [];

  const fakeConsole = {
    log: (...args: unknown[]) => lines.push({ type: "log", text: args.map(serializeValue).join(" ") }),
    error: (...args: unknown[]) => lines.push({ type: "error", text: args.map(serializeValue).join(" ") }),
    warn: (...args: unknown[]) => lines.push({ type: "warn", text: args.map(serializeValue).join(" ") }),
    info: (...args: unknown[]) => lines.push({ type: "info", text: args.map(serializeValue).join(" ") }),
  };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", code);
    const ret = fn(fakeConsole);
    if (ret !== undefined) {
      lines.push({ type: "return", text: `← ${serializeValue(ret)}` });
    }
  } catch (e: unknown) {
    lines.push({ type: "error", text: `Uncaught ${e instanceof Error ? e.message : String(e)}` });
  }

  return lines;
}

export function Playground() {
  const [mode, setMode] = useState<Mode>("ide");
  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [ran, setRan] = useState(false);

  // Console REPL state
  const [replInput, setReplInput] = useState("");
  const [replHistory, setReplHistory] = useState<OutputLine[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const replRef = useRef<HTMLInputElement>(null);

  const handleRun = useCallback(() => {
    const result = runCode(code);
    setOutput(result);
    setRan(true);
  }, [code]);

  const handleClear = () => {
    setOutput([]);
    setRan(false);
  };

  const handleReplSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && replInput.trim()) {
      const input = replInput.trim();
      const inputLine: OutputLine = { type: "info", text: `> ${input}` };
      const result = runCode(input);
      setReplHistory((h) => [...h, inputLine, ...result]);
      setCmdHistory((h) => [input, ...h]);
      setReplInput("");
      setHistoryIdx(-1);
    } else if (e.key === "ArrowUp") {
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setReplInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setReplInput(next === -1 ? "" : cmdHistory[next]);
    }
  };

  const lineColor = (type: OutputLine["type"]) => {
    if (type === "error") return "text-red-400";
    if (type === "warn") return "text-yellow-400";
    if (type === "return") return "text-primary";
    if (type === "info") return "text-muted-foreground";
    return "text-green-400";
  };

  return (
    <div className="flex flex-col h-full min-h-[100dvh]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              onClick={() => setMode("ide")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
                mode === "ide"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              IDE
            </button>
            <button
              onClick={() => setMode("console")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-border",
                mode === "console"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              Console
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "ide" && (
            <>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Run
              </button>
            </>
          )}
          {mode === "console" && (
            <button
              onClick={() => setReplHistory([])}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* IDE mode */}
      {mode === "ide" && (
        <div className="flex flex-1 overflow-hidden divide-x divide-border">
          {/* Editor pane */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 shrink-0">
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="text-xs text-muted-foreground font-mono">script.js</span>
            </div>
            <div className="flex flex-1 overflow-hidden font-mono text-sm">
              {/* Line numbers */}
              <div className="select-none py-4 px-3 text-right text-muted-foreground/40 bg-muted/10 border-r border-border leading-6 min-w-[3rem] shrink-0 overflow-hidden">
                {code.split("\n").map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => { setCode(e.target.value); setRan(false); }}
                spellCheck={false}
                className="flex-1 resize-none bg-transparent text-foreground p-4 outline-none leading-6 overflow-auto"
                style={{ fontFamily: "var(--app-font-mono)", tabSize: 2 }}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const s = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const newVal = code.substring(0, s) + "  " + code.substring(end);
                    setCode(newVal);
                    setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleRun();
                }}
              />
            </div>
          </div>

          {/* Output pane */}
          <div className="flex flex-col w-[40%] shrink-0 min-w-[280px]">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 shrink-0">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">Output</span>
              {ran && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {output.length} line{output.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-6">
              {!ran && (
                <p className="text-muted-foreground/50 text-xs">
                  Press Run or Ctrl+Enter to execute
                </p>
              )}
              {ran && output.length === 0 && (
                <p className="text-muted-foreground/50 text-xs">No output</p>
              )}
              {output.map((line, i) => (
                <div key={i} className={cn("whitespace-pre-wrap break-all", lineColor(line.type))}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Console mode */}
      {mode === "console" && (
        <div
          className="flex flex-col flex-1 font-mono text-sm overflow-hidden"
          onClick={() => replRef.current?.focus()}
        >
          <div className="flex-1 overflow-auto p-4 leading-6 space-y-0.5">
            {replHistory.length === 0 && (
              <p className="text-muted-foreground/50 text-xs">
                JavaScript console. Type an expression and press Enter.
              </p>
            )}
            {replHistory.map((line, i) => (
              <div key={i} className={cn("whitespace-pre-wrap break-all flex gap-2", lineColor(line.type))}>
                {line.type === "info" && <ChevronRight className="h-3.5 w-3.5 mt-1 shrink-0 text-muted-foreground" />}
                <span>{line.type === "info" ? line.text.slice(2) : line.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border px-4 py-3 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
            <input
              ref={replRef}
              autoFocus
              value={replInput}
              onChange={(e) => setReplInput(e.target.value)}
              onKeyDown={handleReplSubmit}
              placeholder="Type JS expression..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40"
              style={{ fontFamily: "var(--app-font-mono)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
