import { useState, useRef } from "react";
import { Award, Code2, CheckCircle2, XCircle, Play, HelpCircle, ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizzes, codingChallenges, QuizQuestion, CodingChallenge } from "@/data/practiceData";

type Tab = "quizzes" | "challenges";

export function Practice() {
  const [activeTab, setActiveTab] = useState<Tab>("quizzes");

  // Quiz state
  const [selectedQuizIdx, setSelectedQuizIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});

  // Challenge state
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState(0);
  const [challengeCode, setChallengeCode] = useState(codingChallenges[0].starterCode);
  const [testResult, setTestResult] = useState<{ status: "idle" | "success" | "error"; message: string }>({
    status: "idle",
    message: ""
  });

  const activeQuiz = quizzes[selectedQuizIdx];
  const activeChallenge = codingChallenges[selectedChallengeIdx];

  const handleQuizSubmit = () => {
    if (selectedOptionIdx === null || submittedQuiz) return;
    setSubmittedQuiz(true);
    const correct = selectedOptionIdx === activeQuiz.answerIndex;
    if (correct) {
      setQuizScore(s => s + 1);
    }
    setCompletedQuizzes(prev => ({ ...prev, [activeQuiz.id]: correct }));
  };

  const handleNextQuiz = () => {
    if (selectedQuizIdx < quizzes.length - 1) {
      setSelectedQuizIdx(selectedQuizIdx + 1);
      setSelectedOptionIdx(null);
      setSubmittedQuiz(false);
    }
  };

  const handleResetQuizzes = () => {
    setSelectedQuizIdx(0);
    setSelectedOptionIdx(null);
    setSubmittedQuiz(false);
    setQuizScore(0);
    setCompletedQuizzes({});
  };

  const selectChallenge = (idx: number) => {
    setSelectedChallengeIdx(idx);
    setChallengeCode(codingChallenges[idx].starterCode);
    setTestResult({ status: "idle", message: "" });
  };

  const runChallengeTests = () => {
    try {
      // Build a sandboxed function with challenge starter + test suite
      // eslint-disable-next-line no-new-func
      const runner = new Function(
        `
        ${challengeCode}
        return ${activeChallenge.testSuite}
        `
      );

      runner();
      setTestResult({
        status: "success",
        message: "🎉 All tests passed successfully! Fantastic code!"
      });
    } catch (e: unknown) {
      setTestResult({
        status: "error",
        message: `❌ Test failed: ${e instanceof Error ? e.message : String(e)}`
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Practice Arena
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Test your conceptual understanding and write practical code with live browser unit tests.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border/50 gap-4">
        <button
          onClick={() => setActiveTab("quizzes")}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "quizzes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <HelpCircle className="h-4 w-4" />
          Interactive Quizzes
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "challenges"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Code2 className="h-4 w-4" />
          Coding Assignments
        </button>
      </div>

      {/* Tab: Quizzes */}
      {activeTab === "quizzes" && (
        <div className="grid md:grid-cols-4 gap-8">
          {/* Quizzes Sidebar List */}
          <div className="md:col-span-1 space-y-2">
            <div className="rounded-xl border bg-card/65 backdrop-blur-sm p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                <span>Quiz List</span>
                <span className="text-primary font-mono">{quizScore}/{quizzes.length} Correct</span>
              </div>
              <div className="space-y-1">
                {quizzes.map((quiz, idx) => {
                  const isCompleted = completedQuizzes[quiz.id] !== undefined;
                  const isCorrect = completedQuizzes[quiz.id];
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setSelectedQuizIdx(idx);
                        setSelectedOptionIdx(null);
                        setSubmittedQuiz(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                        selectedQuizIdx === idx
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{quiz.topic}</span>
                      {isCompleted && (
                        isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleResetQuizzes}
                className="w-full mt-4 text-center text-[10px] text-muted-foreground hover:text-primary transition-colors underline"
              >
                Reset Progress
              </button>
            </div>
          </div>

          {/* Active Quiz Area */}
          <div className="md:col-span-3">
            <div className="rounded-xl border bg-card/65 backdrop-blur-sm p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                  {activeQuiz.topic}
                </span>
                <span className="text-xs text-muted-foreground">
                  Question {selectedQuizIdx + 1} of {quizzes.length}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {activeQuiz.question}
              </h3>

              {activeQuiz.code && (
                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-5">
                  <code>{activeQuiz.code}</code>
                </pre>
              )}

              {/* Options selection */}
              <div className="space-y-2">
                {activeQuiz.options.map((option, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  const showCorrect = submittedQuiz && idx === activeQuiz.answerIndex;
                  const showIncorrect = submittedQuiz && isSelected && idx !== activeQuiz.answerIndex;

                  return (
                    <button
                      key={idx}
                      disabled={submittedQuiz}
                      onClick={() => setSelectedOptionIdx(idx)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm flex items-center justify-between",
                        submittedQuiz ? "cursor-default" : "hover:border-primary/50 hover:bg-muted/30",
                        isSelected && !submittedQuiz && "border-primary bg-primary/5",
                        showCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium",
                        showIncorrect && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                      )}
                    >
                      <span>{option}</span>
                      {showCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 ml-2" />}
                      {showIncorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                {!submittedQuiz ? (
                  <button
                    disabled={selectedOptionIdx === null}
                    onClick={handleQuizSubmit}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-5 font-semibold text-xs text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  selectedQuizIdx < quizzes.length - 1 ? (
                    <button
                      onClick={handleNextQuiz}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-5 font-semibold text-xs text-foreground hover:bg-muted/50 transition-colors gap-1.5"
                    >
                      Next Question
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold">
                      <Award className="h-4 w-4" />
                      Quiz Complete!
                    </div>
                  )
                )}
              </div>

              {/* Explanation */}
              {submittedQuiz && (
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 text-xs leading-relaxed space-y-1.5">
                  <h4 className="font-semibold text-foreground">Explanation:</h4>
                  <p className="text-muted-foreground">{activeQuiz.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coding Challenges */}
      {activeTab === "challenges" && (
        <div className="grid md:grid-cols-4 gap-8">
          {/* Challenges list */}
          <div className="md:col-span-1 space-y-2">
            <div className="rounded-xl border bg-card/65 backdrop-blur-sm p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                Coding Problems
              </span>
              <div className="space-y-1">
                {codingChallenges.map((challenge, idx) => (
                  <button
                    key={challenge.id}
                    onClick={() => selectChallenge(idx)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                      selectedChallengeIdx === idx
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{challenge.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Playground Pane */}
          <div className="md:col-span-3 space-y-4">
            <div className="rounded-xl border bg-card/65 backdrop-blur-sm overflow-hidden shadow-sm flex flex-col">
              {/* Challenge description */}
              <div className="p-5 border-b space-y-2">
                <h3 className="text-lg font-bold text-foreground">{activeChallenge.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeChallenge.description}
                </p>
              </div>

              {/* Sandbox Editor split */}
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Editor textarea */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                    <span className="text-[10px] text-muted-foreground font-mono">solution.js</span>
                  </div>
                  <textarea
                    value={challengeCode}
                    onChange={(e) => setChallengeCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-64 resize-none bg-transparent text-foreground p-4 outline-none font-mono text-xs leading-5"
                    style={{ fontFamily: "var(--app-font-mono)", tabSize: 2 }}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const s = e.currentTarget.selectionStart;
                        const end = e.currentTarget.selectionEnd;
                        const newVal = challengeCode.substring(0, s) + "  " + challengeCode.substring(end);
                        setChallengeCode(newVal);
                        setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Runner panel */}
              <div className="border-t border-border bg-muted/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono">
                  {testResult.status === "idle" && (
                    <span className="text-muted-foreground">Write your code and click Run Tests</span>
                  )}
                  {testResult.status === "success" && (
                    <span className="text-green-600 dark:text-green-400 font-semibold">{testResult.message}</span>
                  )}
                  {testResult.status === "error" && (
                    <span className="text-red-500 font-semibold">{testResult.message}</span>
                  )}
                </div>
                <button
                  onClick={runChallengeTests}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 font-semibold text-xs text-primary-foreground shadow hover:bg-primary/90 transition-colors gap-1.5 shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run Tests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
