import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Play, 
  Trash2, 
  Terminal, 
  Code2, 
  ChevronRight, 
  Folder, 
  Search, 
  Settings, 
  FileCode2, 
  Plus, 
  X, 
  Edit2, 
  Sparkles, 
  Save, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Maximize2,
  Minimize2,
  ChevronDown,
  Copy,
  Check,
  ChevronUp,
  FilePlus,
  Info as InfoIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import Editor, { Monaco } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

type OutputLine = { type: "log" | "error" | "warn" | "return" | "info"; text: string };
type SidebarTab = "explorer" | "search" | "snippets" | "settings";

const STARTER = `// JavaScript Playground (VS Code Mode)
// Click 'Run' or press Ctrl+Enter to execute.

function greet(name) {
  return \`Hello, \${name}! Welcome to the IDE.\`;
}

console.log(greet("Developer"));

// Try running an async operation (real-time logs work here!)
setTimeout(() => {
  console.log("Delayed log after 1 second...");
}, 1000);

// Array functions
const scores = [85, 92, 78, 95, 88];
const highScores = scores.filter(s => s > 85).map(s => s * 1.1);
console.log("Boosted High Scores:", highScores);
`;

const SNIPPETS_LIST = [
  {
    name: "Console Log",
    prefix: "clg",
    description: "Insert console.log() statement",
    category: "Basic JS",
    code: "console.log($1);"
  },
  {
    name: "Fetch API (GET JSON)",
    prefix: "fetch-json",
    description: "Fetch JSON data from a URL",
    category: "Async & Net",
    code: "fetch('${1:https://jsonplaceholder.typicode.com/todos/1}')\n  .then(response => response.json())\n  .then(data => {\n    console.log(data);\n  })\n  .catch(error => {\n    console.error(\"Fetch error:\", error);\n  });"
  },
  {
    name: "Async IIFE",
    prefix: "async-iife",
    description: "Immediately Invoked Function Expression running in async scope",
    category: "Async & Net",
    code: "(async () => {\n  try {\n    $0\n  } catch (err) {\n    console.error(err);\n  }\n})();"
  },
  {
    name: "New Promise",
    prefix: "promise-new",
    description: "Create a new ES6 Promise",
    category: "Async & Net",
    code: "new Promise((resolve, reject) => {\n  $0\n});"
  },
  {
    name: "Set Timeout",
    prefix: "timeout-set",
    description: "Execute callback after a delay",
    category: "Async & Net",
    code: "setTimeout(() => {\n  $0\n}, ${1:1000});"
  },
  {
    name: "Set Interval",
    prefix: "interval-set",
    description: "Repeatedly execute callback with a fixed delay",
    category: "Async & Net",
    code: "const ${1:intervalId} = setInterval(() => {\n  $0\n}, ${2:1000});"
  },
  {
    name: "Array Map",
    prefix: "arr-map",
    description: "Map over array elements",
    category: "Array Methods",
    code: "${1:array}.map(${2:item} => ${3:item})"
  },
  {
    name: "Array Filter",
    prefix: "arr-filter",
    description: "Filter array elements based on condition",
    category: "Array Methods",
    code: "${1:array}.filter(${2:item} => ${3:condition})"
  },
  {
    name: "Array Reduce",
    prefix: "arr-reduce",
    description: "Reduce array elements to a single value",
    category: "Array Methods",
    code: "${1:array}.reduce((acc, ${2:item}) => {\n  $0\n  return acc;\n}, ${3:initialValue})"
  },
  {
    name: "For...Of Loop",
    prefix: "for-of",
    description: "Iterate over an iterable object",
    category: "Basic JS",
    code: "for (const ${1:item} of ${2:iterable}) {\n  $0\n}"
  },
  {
    name: "Try/Catch Block",
    prefix: "try-catch",
    description: "Wrap statements in try/catch block",
    category: "Basic JS",
    code: "try {\n  $1\n} catch (${2:error}) {\n  console.error(${2:error});\n}"
  },
  {
    name: "Arrow Function",
    prefix: "arrow-fn",
    description: "Create an arrow function expression",
    category: "Basic JS",
    code: "const ${1:name} = (${2:params}) => {\n  $0\n};"
  }
];

export function Playground() {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  // Workspace Files state
  const [files, setFiles] = useState<Record<string, string>>(() => ({
    "script.js": STARTER,
    "demo.js": "// Demo workspace file\nconsole.log('Running demo.js...');\n",
  }));
  const [openTabs, setOpenTabs] = useState<string[]>(["script.js", "demo.js"]);
  const [activeFile, setActiveFile] = useState<string>("script.js");

  // Output/REPL execution states
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [ran, setRan] = useState(false);
  const [replInput, setReplInput] = useState("");
  const [replHistory, setReplHistory] = useState<OutputLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Caret position & problem markers
  const [caret, setCaret] = useState({ line: 1, col: 1, pos: 0 });
  const [problems, setProblems] = useState<any[]>([]);

  // Layout states
  const [activeSidebar, setActiveSidebar] = useState<SidebarTab>("explorer");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bottomPanelTab, setBottomPanelTab] = useState<"output" | "terminal" | "problems">("output");
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);

  // File explorer controls
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isRenamingFile, setIsRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ file: string; line: number; text: string }[]>([]);

  // Snippets copy confirmation helper
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // User preference settings
  const [settings, setSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: "on" as "on" | "off",
    minimap: true,
    theme: "vs-dark" as "vs-dark" | "vs",
  });

  // Editor refs
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionProviderRef = useRef<any>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load files and settings on mount
  useEffect(() => {
    try {
      const rawFiles = localStorage.getItem("playground_files");
      if (rawFiles) {
        const parsed = JSON.parse(rawFiles) as Record<string, string>;
        setFiles(parsed);
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          setOpenTabs(keys.slice(0, 5));
          setActiveFile(keys[0]);
        }
      }
      
      const rawSettings = localStorage.getItem("playground_settings");
      if (rawSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(rawSettings) }));
      }
    } catch {}
  }, []);

  // Auto-scroll outputs to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replHistory]);

  // Update theme of Monaco Editor when next-themes resolvedTheme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(resolvedTheme === "dark" ? "vs-dark" : "vs");
    }
  }, [resolvedTheme]);

  // Handle Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results: { file: string; line: number; text: string }[] = [];
    const q = searchQuery.toLowerCase();
    Object.entries(files).forEach(([filename, content]) => {
      const lines = content.split("\n");
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(q)) {
          results.push({
            file: filename,
            line: idx + 1,
            text: lineText.trim()
          });
        }
      });
    });
    setSearchResults(results);
  }, [searchQuery, files]);

  // Global Shortcuts: Ctrl+S to save workspace, Ctrl+Enter to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveWorkspace();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode(files[activeFile] ?? "");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, activeFile]);

  // Cleanup Monaco completion provider on component destruction
  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, []);

  // Save files to local storage
  const saveWorkspace = () => {
    try {
      localStorage.setItem("playground_files", JSON.stringify(files));
      toast({
        title: "Workspace Saved",
        description: `Successfully saved all ${Object.keys(files).length} files to local storage.`,
      });
    } catch {
      toast({
        title: "Save Failed",
        description: "Failed to save files to local storage.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("playground_settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Execution environment console runner
  const runCode = (code: string) => {
    setOutput([]);
    setRan(true);
    setBottomPanelTab("output");
    setIsBottomPanelOpen(true);

    const serializeValue = (val: unknown): string => {
      if (val === null) return "null";
      if (val === undefined) return "undefined";
      if (typeof val === "string") return `"${val}"`;
      if (typeof val === "function") return val.toString().split("\n")[0] + " ... }";
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "object") {
        try { return JSON.stringify(val, null, 2); } catch { return String(val); }
      }
      return String(val);
    };

    const fakeConsole = {
      log: (...args: unknown[]) => {
        setOutput(prev => [...prev, { type: "log", text: args.map(serializeValue).join(" ") }]);
      },
      error: (...args: unknown[]) => {
        setOutput(prev => [...prev, { type: "error", text: args.map(serializeValue).join(" ") }]);
      },
      warn: (...args: unknown[]) => {
        setOutput(prev => [...prev, { type: "warn", text: args.map(serializeValue).join(" ") }]);
      },
      info: (...args: unknown[]) => {
        setOutput(prev => [...prev, { type: "info", text: args.map(serializeValue).join(" ") }]);
      },
    };

    const fakeRequire = (moduleName: string) => {
      throw new Error(
        `Cannot find module '${moduleName}'.\n` +
        `Note: CommonJS require() and Node.js core modules (like 'fs', 'path', 'os') are not supported in browser-based environments.\n` +
        `Only standard ES6 JavaScript and browser-native APIs (like fetch, Map, Set, Promises) are supported in this playground.`
      );
    };

    // Pre-execution warnings for imports
    if (code.includes("import ") && !code.includes("import.meta")) {
      setOutput(prev => [
        ...prev, 
        { 
          type: "warn", 
          text: "⚠️ Warning: Static 'import' statement detected. Dynamic import() is supported, but standard ES modules are not fully compatible inside inline sandboxes. Please define classes/utilities locally." 
        }
      ]);
    }

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", "require", code);
      const ret = fn(fakeConsole, fakeRequire);
      if (ret !== undefined) {
        setOutput(prev => [...prev, { type: "return", text: `← ${serializeValue(ret)}` }]);
      }
    } catch (e: unknown) {
      setOutput(prev => [...prev, { type: "error", text: `Uncaught ${e instanceof Error ? e.message : String(e)}` }]);
    }
  };

  // REPL Console Runner
  const runRepl = (code: string) => {
    const serializeValue = (val: unknown): string => {
      if (val === null) return "null";
      if (val === undefined) return "undefined";
      if (typeof val === "string") return `"${val}"`;
      if (typeof val === "function") return val.toString().split("\n")[0] + " ... }";
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "object") {
        try { return JSON.stringify(val, null, 2); } catch { return String(val); }
      }
      return String(val);
    };

    const fakeConsole = {
      log: (...args: unknown[]) => {
        setReplHistory(prev => [...prev, { type: "log", text: args.map(serializeValue).join(" ") }]);
      },
      error: (...args: unknown[]) => {
        setReplHistory(prev => [...prev, { type: "error", text: args.map(serializeValue).join(" ") }]);
      },
      warn: (...args: unknown[]) => {
        setReplHistory(prev => [...prev, { type: "warn", text: args.map(serializeValue).join(" ") }]);
      },
      info: (...args: unknown[]) => {
        setReplHistory(prev => [...prev, { type: "info", text: args.map(serializeValue).join(" ") }]);
      },
    };

    const fakeRequire = (moduleName: string) => {
      throw new Error(
        `Cannot find module '${moduleName}'.\n` +
        `Note: CommonJS require() and Node.js core modules (like 'fs', 'path', 'os') are not supported in browser-based environments.\n` +
        `Only standard ES6 JavaScript and browser-native APIs (like fetch, Map, Set, Promises) are supported in this playground.`
      );
    };

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", "require", code);
      const ret = fn(fakeConsole, fakeRequire);
      if (ret !== undefined) {
        setReplHistory(prev => [...prev, { type: "return", text: `← ${serializeValue(ret)}` }]);
      }
    } catch (e: unknown) {
      setReplHistory(prev => [...prev, { type: "error", text: `Uncaught ${e instanceof Error ? e.message : String(e)}` }]);
    }
  };

  const handleReplSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && replInput.trim()) {
      const input = replInput.trim();
      const inputLine: OutputLine = { type: "info", text: `> ${input}` };
      setReplHistory((h) => [...h, inputLine]);
      runRepl(input);
      setCmdHistory((h) => [input, ...h]);
      setReplInput("");
      setHistoryIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setReplInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setReplInput(next === -1 ? "" : cmdHistory[next]);
    }
  };

  // Format active document using Monaco's built-in formatting commands
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast({
        title: "Code Formatted",
        description: "Formatted active JavaScript file using Monaco formatting.",
      });
    }
  };

  // Toggle layout panel
  const toggleBottomPanel = () => {
    setIsBottomPanelOpen(!isBottomPanelOpen);
  };

  // Sidebar controls
  const toggleSidebar = (tab: SidebarTab) => {
    if (activeSidebar === tab && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveSidebar(tab);
      setIsSidebarOpen(true);
    }
  };

  // Workspace file helpers
  const selectFile = (name: string) => {
    if (!openTabs.includes(name)) {
      setOpenTabs(prev => [...prev, name]);
    }
    setActiveFile(name);
  };

  const closeFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter(t => t !== name);
    setOpenTabs(nextTabs);
    if (activeFile === name) {
      if (nextTabs.length > 0) {
        setActiveFile(nextTabs[nextTabs.length - 1]);
      } else {
        const remaining = Object.keys(files).filter(f => f !== name);
        if (remaining.length > 0) {
          setOpenTabs([remaining[0]]);
          setActiveFile(remaining[0]);
        }
      }
    }
  };

  const handleCreateFileSubmit = () => {
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }
    let name = newFileName.trim();
    if (!name.endsWith(".js") && !name.endsWith(".md")) {
      name += ".js";
    }
    if (files[name] !== undefined) {
      toast({
        title: "File exists",
        description: `A file named "${name}" already exists.`,
        variant: "destructive"
      });
      return;
    }
    setFiles(prev => {
      const next = { ...prev, [name]: name.endsWith(".md") ? "# New markdown file\n" : "// New script\n" };
      localStorage.setItem("playground_files", JSON.stringify(next));
      return next;
    });
    setOpenTabs(prev => [...prev, name]);
    setActiveFile(name);
    setIsCreatingFile(false);
    setNewFileName("");
  };

  const handleRenameFileSubmit = (oldName: string) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setIsRenamingFile(null);
      return;
    }
    let newName = renameValue.trim();
    if (!newName.endsWith(".js") && !newName.endsWith(".md")) {
      newName += ".js";
    }
    if (files[newName] !== undefined) {
      toast({
        title: "Name Conflict",
        description: `A file named "${newName}" already exists.`,
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => {
      const next = { ...prev };
      next[newName] = next[oldName];
      delete next[oldName];
      localStorage.setItem("playground_files", JSON.stringify(next));
      return next;
    });

    setOpenTabs(prev => prev.map(t => t === oldName ? newName : t));
    if (activeFile === oldName) {
      setActiveFile(newName);
    }
    setIsRenamingFile(null);
  };

  const handleDeleteFile = (name: string) => {
    if (Object.keys(files).length <= 1) {
      toast({
        title: "Action Restricted",
        description: "Your playground workspace must contain at least one file.",
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => {
      const next = { ...prev };
      delete next[name];
      localStorage.setItem("playground_files", JSON.stringify(next));
      return next;
    });

    const nextTabs = openTabs.filter(t => t !== name);
    setOpenTabs(nextTabs);
    if (activeFile === name) {
      const remaining = Object.keys(files).filter(f => f !== name);
      if (nextTabs.length > 0) {
        setActiveFile(nextTabs[nextTabs.length - 1]);
      } else {
        setOpenTabs([remaining[0]]);
        setActiveFile(remaining[0]);
      }
    }
  };

  // Insert snippet code at cursor
  const insertSnippetCode = (codeText: string) => {
    if (editorRef.current) {
      const contribution = editorRef.current.getContribution("snippetController2") as any;
      if (contribution) {
        editorRef.current.focus();
        contribution.insert(codeText, 0, 0, false, false);
      } else {
        // Fallback standard edit
        const position = editorRef.current.getPosition();
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        };
        editorRef.current.executeEdits("snippet-insert", [{
          range,
          text: codeText,
          forceMoveMarkers: true
        }]);
        editorRef.current.focus();
      }
    }
  };

  // Sync editor value updates back to file state
  const handleCodeChange = (newVal: string | undefined) => {
    if (newVal === undefined) return;
    setFiles(prev => {
      const next = { ...prev, [activeFile]: newVal };
      try {
        localStorage.setItem("playground_files", JSON.stringify(next));
      } catch {}
      return next;
    });
    setRan(false);
  };

  // Custom File Icon renderer
  const FileIcon = ({ name }: { name: string }) => {
    if (name.endsWith(".js")) {
      return (
        <div className="w-4 h-4 bg-yellow-500 rounded-sm text-[8px] font-black text-black flex items-center justify-center font-mono select-none shrink-0">
          JS
        </div>
      );
    }
    if (name.endsWith(".md")) {
      return (
        <div className="w-4 h-4 bg-blue-500 rounded-sm text-[8px] font-black text-white flex items-center justify-center font-mono select-none shrink-0">
          M↓
        </div>
      );
    }
    return <FileCode2 className="w-4 h-4 text-zinc-400 shrink-0" />;
  };

  // Monaco initialization hook
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure JavaScript compiler options to disable Node.js global definitions
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2022,
      allowNonTsExtensions: true,
      lib: ['es2022', 'dom'] // Browser environment libraries, omitting Node.js globals like require/process
    });

    // Clean up old provider if present to avoid duplications
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }

    // Register our custom autocomplete snippet provider
    const suggestions = SNIPPETS_LIST.map(sn => ({
      label: sn.prefix,
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: sn.code,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: sn.name,
      documentation: sn.description
    }));

    completionProviderRef.current = monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        // Return suggestions with current range boundaries to prevent editor glitches
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        return {
          suggestions: suggestions.map(s => ({ ...s, range }))
        };
      }
    });

    // Listen to cursor movement to update status bar caret Ln/Col counters
    editor.onDidChangeCursorPosition((e: any) => {
      const model = editor.getModel();
      if (model) {
        setCaret({
          line: e.position.lineNumber,
          col: e.position.column,
          pos: model.getOffsetAt(e.position)
        });
      }
    });

    // Listen to problems markers validation changes
    const model = editor.getModel();
    if (model) {
      const updateMarkers = () => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        setProblems(markers);
      };
      editor.onDidChangeModelContent(() => {
        setTimeout(updateMarkers, 500);
      });
      setTimeout(updateMarkers, 500);
    }
  };

  // Jump cursor to warning/error on double click or click in Problems list
  const handleProblemClick = (prob: any) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(prob.startLineNumber);
      editorRef.current.setPosition({
        lineNumber: prob.startLineNumber,
        column: prob.startColumn
      });
      editorRef.current.focus();
    }
  };

  // Get severity styles for markers list
  const getProblemIcon = (severity: number) => {
    if (severity === 8) return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />; // Error
    if (severity === 4) return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />; // Warning
    return <Info className="w-4 h-4 text-blue-400 shrink-0" />; // Info
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1e1e1e] text-zinc-300 select-none overflow-hidden font-sans">
      
      {/* Top Workspace Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#252526] bg-[#3c3c3c] dark:bg-[#1e1e1c]/90 text-zinc-300 text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 font-mono">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="ml-2 font-semibold tracking-wide text-zinc-100 uppercase">JS Learn IDE</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <div className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono border border-zinc-700">
            Browser Runtime (HTML5 Sandboxed)
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        
        {/* Leftmost Activity Bar */}
        <div className="w-12 bg-[#333333] dark:bg-[#181818] border-r border-[#252526] flex flex-col justify-between py-4 shrink-0">
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => toggleSidebar("explorer")}
              className={cn(
                "p-2.5 rounded-lg transition-colors relative group",
                isSidebarOpen && activeSidebar === "explorer"
                  ? "text-primary bg-zinc-800/80 dark:bg-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
              title="Explorer"
            >
              <Folder className="w-5 h-5" />
              <span className="absolute left-14 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-zinc-700 shadow-md">
                Explorer (Ctrl+Shift+E)
              </span>
            </button>

            <button
              onClick={() => toggleSidebar("search")}
              className={cn(
                "p-2.5 rounded-lg transition-colors relative group",
                isSidebarOpen && activeSidebar === "search"
                  ? "text-primary bg-zinc-800/80 dark:bg-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
              title="Search"
            >
              <Search className="w-5 h-5" />
              <span className="absolute left-14 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-zinc-700 shadow-md">
                Search Files
              </span>
            </button>

            <button
              onClick={() => toggleSidebar("snippets")}
              className={cn(
                "p-2.5 rounded-lg transition-colors relative group",
                isSidebarOpen && activeSidebar === "snippets"
                  ? "text-primary bg-zinc-800/80 dark:bg-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
              title="JS Snippets"
            >
              <Code2 className="w-5 h-5" />
              <span className="absolute left-14 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-zinc-700 shadow-md">
                Snippets Library
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => toggleSidebar("settings")}
              className={cn(
                "p-2.5 rounded-lg transition-colors relative group",
                isSidebarOpen && activeSidebar === "settings"
                  ? "text-primary bg-zinc-800/80 dark:bg-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
              <span className="absolute left-14 bg-zinc-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-zinc-700 shadow-md">
                Settings
              </span>
            </button>
          </div>
        </div>

        {/* Resizable Horizontal Panel for SideBar + Main Editing Area */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          
          {/* Sidebar Panel */}
          {isSidebarOpen && (
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={40}
              className="bg-[#252526] dark:bg-[#1e1e1e] border-r border-[#252526] flex flex-col h-full overflow-hidden"
            >
              <div className="px-4 py-2 border-b border-[#252526] text-[10px] font-bold tracking-wider text-zinc-400 uppercase select-none flex justify-between items-center shrink-0">
                <span>{activeSidebar}</span>
                {activeSidebar === "explorer" && (
                  <button
                    onClick={() => {
                      setIsCreatingFile(true);
                      setNewFileName("");
                    }}
                    className="p-1 hover:bg-zinc-800 dark:hover:bg-zinc-700 hover:text-zinc-200 rounded transition-colors"
                    title="New File..."
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {/* EXPLORER VIEW */}
                {activeSidebar === "explorer" && (
                  <div className="flex flex-col h-full text-zinc-400 text-xs">
                    {/* Open Tabs list */}
                    <div className="border-b border-[#252526] py-2 flex flex-col">
                      <div className="px-4 flex items-center justify-between uppercase font-bold tracking-wider text-[9px] text-zinc-500 mb-1 select-none">
                        Open Editors
                      </div>
                      <div className="flex flex-col">
                        {openTabs.map((tab) => (
                          <div
                            key={tab}
                            onClick={() => setActiveFile(tab)}
                            className={cn(
                              "flex items-center justify-between px-4 py-1.5 hover:bg-zinc-800/40 cursor-pointer select-none group/tab",
                              activeFile === tab && "bg-[#37373d]/70 text-zinc-100"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileIcon name={tab} />
                              <span className="truncate">{tab}</span>
                            </div>
                            <button
                              onClick={(e) => closeFile(tab, e)}
                              className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 opacity-0 group-hover/tab:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workspace File Tree */}
                    <div className="flex-1 flex flex-col pt-3 min-h-0">
                      <div className="px-4 flex items-center justify-between uppercase font-bold tracking-wider text-[9px] text-zinc-500 mb-2 select-none">
                        <span>Workspace Directory</span>
                      </div>

                      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
                        {/* inline text input for creating a file */}
                        {isCreatingFile && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202021] rounded border border-primary/50">
                            <FileIcon name={newFileName} />
                            <input
                              autoFocus
                              type="text"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateFileSubmit();
                                if (e.key === "Escape") setIsCreatingFile(false);
                              }}
                              onBlur={handleCreateFileSubmit}
                              placeholder="filename.js"
                              className="bg-transparent text-zinc-200 outline-none text-xs w-full py-0.5 font-mono"
                            />
                          </div>
                        )}

                        {/* file rendering rows */}
                        {Object.keys(files).map((filename) => {
                          const isRenaming = isRenamingFile === filename;
                          return (
                            <div
                              key={filename}
                              onClick={() => selectFile(filename)}
                              onDoubleClick={() => {
                                setIsRenamingFile(filename);
                                setRenameValue(filename);
                              }}
                              className={cn(
                                "flex items-center justify-between px-3 py-1.5 rounded hover:bg-zinc-800/40 cursor-pointer select-none group/item",
                                activeFile === filename && "bg-[#37373d] text-zinc-100 font-medium"
                              )}
                            >
                              {isRenaming ? (
                                <div className="flex items-center gap-1.5 w-full">
                                  <FileIcon name={renameValue} />
                                  <input
                                    autoFocus
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleRenameFileSubmit(filename);
                                      if (e.key === "Escape") setIsRenamingFile(null);
                                    }}
                                    onBlur={() => handleRenameFileSubmit(filename)}
                                    className="bg-[#1e1e1e] border border-primary/50 text-zinc-250 outline-none text-xs px-1.5 py-0.5 w-full rounded font-mono"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 truncate">
                                    <FileIcon name={filename} />
                                    <span className="truncate">{filename}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsRenamingFile(filename);
                                        setRenameValue(filename);
                                      }}
                                      className="p-1 text-zinc-500 hover:text-zinc-100 rounded hover:bg-zinc-700/80 transition-colors"
                                      title="Rename..."
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFile(filename);
                                      }}
                                      className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-700/80 transition-colors"
                                      title="Delete File"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SEARCH VIEW */}
                {activeSidebar === "search" && (
                  <div className="p-4 flex flex-col gap-3 font-mono text-xs text-zinc-400">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Find Text</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in all workspace files..."
                          className="w-full bg-[#1e1e1e] border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 outline-none focus:border-primary"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {searchQuery && (
                      <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-[#252526]">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold mb-2">
                          Matches ({searchResults.length})
                        </span>
                        
                        {searchResults.length === 0 ? (
                          <div className="text-[11px] text-zinc-600 italic py-2">No matches found.</div>
                        ) : (
                          <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                            {searchResults.map((res, i) => (
                              <div
                                key={i}
                                onClick={() => {
                                  selectFile(res.file);
                                  // Wait for render cycle to focus Monaco
                                  setTimeout(() => {
                                    if (editorRef.current) {
                                      editorRef.current.revealLineInCenter(res.line);
                                      editorRef.current.setPosition({ lineNumber: res.line, column: 1 });
                                      editorRef.current.focus();
                                    }
                                  }, 50);
                                }}
                                className="p-2 bg-[#202021] hover:bg-[#2c2c2d] border border-zinc-800 rounded cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                                  <span className="text-zinc-300 truncate">{res.file}</span>
                                  <span className="text-primary font-mono text-[9px]">Ln {res.line}</span>
                                </div>
                                <div className="text-[11px] text-zinc-400 italic font-mono truncate bg-[#181819] px-1 py-0.5 rounded border border-zinc-800">
                                  {res.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SNIPPETS LIBRARY VIEW */}
                {activeSidebar === "snippets" && (
                  <div className="p-3 flex flex-col gap-3 h-full">
                    <div className="text-[11px] text-zinc-500 bg-zinc-800/40 p-2.5 rounded border border-zinc-700/50 mb-1 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-350 mb-1">
                        <InfoIcon className="w-3.5 h-3.5 text-primary" />
                        Snippets Autocomplete
                      </div>
                      These JS snippets are registered as shortcuts in the editor. Type their prefix (e.g. <code className="bg-zinc-900 text-yellow-500 px-1 rounded">clg</code>) to invoke them via autocomplete.
                    </div>

                    <div className="space-y-3 pb-4">
                      {["Basic JS", "Async & Net", "Array Methods"].map((category) => (
                        <div key={category} className="space-y-2">
                          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider border-b border-zinc-800 pb-0.5">
                            {category}
                          </div>
                          
                          <div className="space-y-1.5">
                            {SNIPPETS_LIST.filter(s => s.category === category).map((sn) => (
                              <div
                                key={sn.prefix}
                                className="p-2.5 bg-[#202021] border border-zinc-800 rounded-md flex flex-col hover:border-zinc-700 transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-zinc-300">{sn.name}</span>
                                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono select-all">
                                    {sn.prefix}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-500 mt-1 leading-tight">{sn.description}</span>
                                
                                <div className="flex items-center gap-1.5 mt-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => insertSnippetCode(sn.code)}
                                    className="text-[10px] px-2 py-0.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded text-primary transition-colors flex items-center gap-1"
                                  >
                                    Insert
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(sn.code);
                                      setCopiedSnippet(sn.prefix);
                                      setTimeout(() => setCopiedSnippet(null), 2000);
                                    }}
                                    className="text-[10px] px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                                  >
                                    {copiedSnippet === sn.prefix ? (
                                      <>
                                        <Check className="w-3 h-3 text-green-500" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SETTINGS VIEW */}
                {activeSidebar === "settings" && (
                  <div className="p-4 flex flex-col gap-4 text-xs font-mono text-zinc-400">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Editor Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => updateSetting("theme", e.target.value as "vs-dark" | "vs")}
                        className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1.5 text-zinc-300 outline-none"
                      >
                        <option value="vs-dark">Visual Studio Dark</option>
                        <option value="vs">Visual Studio Light</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Font Size ({settings.fontSize}px)</label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={settings.fontSize}
                        onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Tab Size</label>
                      <select
                        value={settings.tabSize}
                        onChange={(e) => updateSetting("tabSize", parseInt(e.target.value))}
                        className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1.5 text-zinc-300 outline-none"
                      >
                        <option value="2">2 Spaces</option>
                        <option value="4">4 Spaces</option>
                        <option value="8">8 Spaces</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Word Wrap</label>
                      <select
                        value={settings.wordWrap}
                        onChange={(e) => updateSetting("wordWrap", e.target.value as "on" | "off")}
                        className="w-full bg-[#1e1e1e] border border-zinc-700 rounded p-1.5 text-zinc-300 outline-none"
                      >
                        <option value="on">On (Wrap lines)</option>
                        <option value="off">Off (Horizontal Scroll)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-zinc-800 mt-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Editor Minimap</span>
                      <input
                        type="checkbox"
                        checked={settings.minimap}
                        onChange={(e) => updateSetting("minimap", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          )}

          {/* Resizable Sidebar Splitter */}
          {isSidebarOpen && <ResizableHandle />}

          {/* Main Editing Area + Bottom integrated panel */}
          <ResizablePanel defaultSize={80} className="flex flex-col h-full bg-[#1e1e1e]">
            
            <ResizablePanelGroup direction="vertical">
              
              {/* Top Editor Area */}
              <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col h-full overflow-hidden">
                
                {/* Editor Tabs bar & toolbar */}
                <div className="flex items-center justify-between border-b border-[#252526] bg-[#2d2d2d] dark:bg-[#18181c]/90 text-xs shrink-0 select-none overflow-x-auto h-9">
                  <div className="flex items-center h-full">
                    {openTabs.map((fn) => (
                      <div
                        key={fn}
                        onClick={() => selectFile(fn)}
                        className={cn(
                          "h-full px-4 flex items-center gap-2 border-r border-[#252526] cursor-pointer select-none text-zinc-400 transition-all group/tab relative",
                          activeFile === fn
                            ? "bg-[#1e1e1e] text-zinc-100 border-t-2 border-t-primary"
                            : "bg-[#2d2d2d] dark:bg-[#1e1e1c]/40 hover:bg-zinc-800/30 hover:text-zinc-200"
                        )}
                      >
                        <FileIcon name={fn} />
                        <span className="font-mono text-xs">{fn}</span>
                        <button
                          onClick={(e) => closeFile(fn, e)}
                          className="p-0.5 rounded hover:bg-zinc-700/80 text-zinc-500 hover:text-zinc-250 opacity-40 group-hover/tab:opacity-100 transition-opacity ml-1.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Editor Actions Menu */}
                  <div className="flex items-center gap-1.5 px-3">
                    <button
                      onClick={formatCode}
                      className="p-1.5 hover:text-zinc-100 rounded hover:bg-zinc-750 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400"
                      title="Format Document (Prettier)"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Format</span>
                    </button>
                    <button
                      onClick={saveWorkspace}
                      className="p-1.5 hover:text-zinc-100 rounded hover:bg-zinc-750 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400"
                      title="Save Workspace (Ctrl+S)"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    
                    <div className="w-px h-4 bg-zinc-750 mx-1" />

                    <button
                      onClick={() => runCode(files[activeFile] ?? "")}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                      title="Run Script (Ctrl+Enter)"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Run
                    </button>

                    <button
                      onClick={toggleBottomPanel}
                      className={cn(
                        "p-1.5 rounded hover:bg-zinc-750 transition-colors text-zinc-400 hover:text-zinc-100 ml-1",
                        isBottomPanelOpen && "bg-zinc-800"
                      )}
                      title="Toggle Output Panel"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Container */}
                <div className="flex-1 w-full min-h-0 bg-[#1e1e1e] relative">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme={settings.theme}
                    value={files[activeFile] ?? ""}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    options={{
                      fontSize: settings.fontSize,
                      tabSize: settings.tabSize,
                      wordWrap: settings.wordWrap,
                      minimap: { enabled: settings.minimap },
                      automaticLayout: true,
                      lineHeight: 22,
                      fontFamily: "var(--app-font-mono)",
                      padding: { top: 8, bottom: 8 },
                      cursorBlinking: "smooth",
                      fontLigatures: true,
                      suggestOnTriggerCharacters: true,
                    }}
                    loading={
                      <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-[#1e1e1e] text-zinc-400 font-mono text-xs">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                        Loading Monaco IDE...
                      </div>
                    }
                  />
                </div>

              </ResizablePanel>

              {/* Resizable Bottom Panel Splitter */}
              {isBottomPanelOpen && <ResizableHandle />}

              {/* Bottom Console Panel */}
              {isBottomPanelOpen && (
                <ResizablePanel defaultSize={40} minSize={15} className="flex flex-col h-full bg-[#181819] overflow-hidden">
                  
                  {/* Bottom Panel Header */}
                  <div className="flex items-center justify-between border-b border-[#252526] bg-[#252526] dark:bg-[#18181c]/90 px-4 py-1 shrink-0 text-[10px] text-zinc-400 font-mono">
                    <div className="flex items-center gap-4 h-7">
                      <button
                        onClick={() => setBottomPanelTab("output")}
                        className={cn(
                          "pb-1 border-b-2 transition-colors uppercase font-bold tracking-wider",
                          bottomPanelTab === "output"
                            ? "border-primary text-zinc-100 font-semibold"
                            : "border-transparent hover:text-zinc-200"
                        )}
                      >
                        Output Log
                      </button>
                      <button
                        onClick={() => setBottomPanelTab("terminal")}
                        className={cn(
                          "pb-1 border-b-2 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5",
                          bottomPanelTab === "terminal"
                            ? "border-primary text-zinc-100 font-semibold"
                            : "border-transparent hover:text-zinc-200"
                        )}
                      >
                        Terminal Console (REPL)
                      </button>
                      <button
                        onClick={() => setBottomPanelTab("problems")}
                        className={cn(
                          "pb-1 border-b-2 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5",
                          bottomPanelTab === "problems"
                            ? "border-primary text-zinc-100 font-semibold"
                            : "border-transparent hover:text-zinc-200"
                        )}
                      >
                        Problems
                        {problems.length > 0 && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded-full min-w-[15px] text-center">
                            {problems.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (bottomPanelTab === "output") {
                            setOutput([]);
                            setRan(false);
                          } else if (bottomPanelTab === "terminal") {
                            setReplHistory([]);
                          }
                        }}
                        className="p-1 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors"
                        title="Clear Panel Output"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={toggleBottomPanel}
                        className="p-1 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors"
                        title="Collapse Console Panel"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Panel Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed select-text min-h-0 bg-[#1e1e1e]">
                    
                    {/* OUTPUT PANEL */}
                    {bottomPanelTab === "output" && (
                      <div className="space-y-0.5">
                        {!ran && (
                          <p className="text-zinc-600 text-[11px] italic font-mono">
                            Console Output Empty. Press 'Run' or Ctrl+Enter to execute javascript...
                          </p>
                        )}
                        {ran && output.length === 0 && (
                          <p className="text-zinc-650 text-[11px] italic font-mono">Process finished. No output logs printed.</p>
                        )}
                        {output.map((line, i) => (
                          <div
                            key={i}
                            className={cn(
                              "whitespace-pre-wrap break-all px-1 py-0.5 font-mono",
                              line.type === "error" && "text-red-400 bg-red-950/20 border-l border-red-500 pl-2",
                              line.type === "warn" && "text-yellow-400 bg-yellow-950/10 border-l border-yellow-500 pl-2",
                              line.type === "return" && "text-emerald-400 font-semibold border-l border-emerald-500 pl-2",
                              line.type === "info" && "text-zinc-500",
                              line.type === "log" && "text-zinc-150"
                            )}
                          >
                            {line.text}
                          </div>
                        ))}
                        <div ref={outputEndRef} />
                      </div>
                    )}

                    {/* REPL INTERACTIVE TERMINAL */}
                    {bottomPanelTab === "terminal" && (
                      <div className="flex flex-col h-full min-h-0 justify-between">
                        <div className="flex-1 overflow-y-auto space-y-1 pb-6 min-h-0">
                          {replHistory.length === 0 && (
                            <p className="text-zinc-500 text-[11px] italic leading-relaxed bg-zinc-800/10 p-2.5 rounded border border-zinc-800">
                              💻 Browser JavaScript Console REPL.<br />
                              Type expressions (e.g. <code className="bg-zinc-800 text-yellow-400 px-1 rounded font-bold">1 + 1</code>, or define variables) and press Enter. Arrow Up/Down traverses command history.<br />
                              Note: CommonJS <code className="text-red-400 bg-zinc-850 px-1 rounded">require()</code> is not available.
                            </p>
                          )}
                          {replHistory.map((line, i) => (
                            <div
                              key={i}
                              className={cn(
                                "whitespace-pre-wrap break-all flex gap-2 font-mono px-1.5 py-0.5 rounded",
                                line.type === "info" && "text-sky-400",
                                line.type === "error" && "text-red-400 bg-red-950/15 border-l border-red-500 pl-2",
                                line.type === "warn" && "text-yellow-400",
                                line.type === "return" && "text-emerald-400 font-semibold",
                                line.type === "log" && "text-zinc-200"
                              )}
                            >
                              {line.type === "info" && <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-sky-500" />}
                              <span>{line.type === "info" ? line.text.substring(2) : line.text}</span>
                            </div>
                          ))}
                          <div ref={terminalEndRef} />
                        </div>
                        
                        <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-2 shrink-0 bg-[#1e1e1e]">
                          <ChevronRight className="h-4 w-4 text-sky-400 shrink-0" />
                          <input
                            autoFocus
                            value={replInput}
                            onChange={(e) => setReplInput(e.target.value)}
                            onKeyDown={handleReplSubmit}
                            placeholder="Type an expression and press Enter..."
                            className="flex-1 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-[13px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* PROBLEMS PANEL */}
                    {bottomPanelTab === "problems" && (
                      <div className="space-y-1.5 font-mono text-xs">
                        {problems.length === 0 ? (
                          <div className="text-zinc-550 italic text-[11px] py-1">
                            No diagnostics problems detected in workspace files. Keep up the clean code!
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {problems.map((prob, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleProblemClick(prob)}
                                className="flex items-start gap-2.5 p-2 bg-[#202021]/80 hover:bg-[#282829] border border-zinc-800/60 rounded cursor-pointer transition-colors"
                              >
                                {getProblemIcon(prob.severity)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 text-zinc-300 font-medium">
                                    <span className="text-zinc-400 truncate">Line {prob.startLineNumber}, Col {prob.startColumn}</span>
                                    <span className="text-[10px] bg-red-950/40 text-red-400 px-1 rounded uppercase font-bold shrink-0 scale-90">
                                      {prob.severity === 8 ? "Error" : "Warning"}
                                    </span>
                                  </div>
                                  <p className="text-zinc-400 mt-1 text-[11px] leading-relaxed break-all select-all">
                                    {prob.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </ResizablePanel>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] font-mono shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-[#1f8ad2] px-1.5 h-full cursor-pointer transition-colors">
            <span className="font-bold">main</span>
          </div>
          {problems.length > 0 && (
            <div
              onClick={() => {
                setBottomPanelTab("problems");
                setIsBottomPanelOpen(true);
              }}
              className="flex items-center gap-1 bg-[#12659e]/70 px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#1f8ad2]"
            >
              <div className="w-2 h-2 bg-red-200 rounded-full" />
              <span>{problems.length} errors</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hover:bg-[#1f8ad2] px-1.5 h-full flex items-center cursor-pointer transition-colors">
            Ln {caret.line}, Col {caret.col}
          </div>
          <div className="hover:bg-[#1f8ad2] px-1.5 h-full flex items-center cursor-pointer transition-colors">
            Spaces: {settings.tabSize}
          </div>
          <div className="hover:bg-[#1f8ad2] px-1.5 h-full flex items-center cursor-pointer transition-colors hidden sm:flex">
            UTF-8
          </div>
          <div className="hover:bg-[#1f8ad2] px-1.5 h-full flex items-center cursor-pointer transition-colors">
            JavaScript
          </div>
          <div className="hover:bg-[#1f8ad2] px-1.5 h-full flex items-center cursor-pointer transition-colors font-bold text-zinc-100">
            Prettier ✓
          </div>
        </div>
      </div>
      
    </div>
  );
}
