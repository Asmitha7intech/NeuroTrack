import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PARAGRAPH = "The quick brown fox jumps over the lazy dog.";

type TypingResult = {
  wpm: number;
  accuracy: number;
  errors: number;
  backspaceCount: number;
  backspace_count: number;
  riskLevel: string;
  risk_level: string;
  summaryText: string;
  summary_text: string;
};

const normalizeText = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const TypingTest: React.FC = () => {
  const [text, setText] = useState("");
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [finalResult, setFinalResult] = useState<TypingResult | null>(null);
  const [status, setStatus] = useState("Ready");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<number | null>(null);

  const targetWords = useMemo(() => PARAGRAPH.split(/\s+/), []);
  const typedWords = useMemo(() => (normalizeText(text) ? normalizeText(text).split(/\s+/) : []), [text]);

  const correctWords = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] === targetWords[i]) count++;
    }
    return count;
  }, [typedWords, targetWords]);

  const errors = useMemo(() => {
    let count = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (targetWords[i] !== undefined && typedWords[i] !== targetWords[i]) {
        count++;
      }
    }
    return count;
  }, [typedWords, targetWords]);

  const liveAccuracy = useMemo(() => {
    if (typedWords.length === 0) return 0;
    return Number(((correctWords / typedWords.length) * 100).toFixed(2));
  }, [correctWords, typedWords.length]);

  const liveWpm = useMemo(() => {
    if (time === 0) return 0;
    return Number(((typedWords.length / time) * 60).toFixed(2));
  }, [typedWords.length, time]);

  const progress = useMemo(() => {
    return Math.min((text.length / PARAGRAPH.length) * 100, 100);
  }, [text]);

  const currentWordIndex = useMemo(() => {
    if (!normalizeText(text)) return 0;
    if (text.endsWith(" ")) return typedWords.length;
    return Math.max(typedWords.length - 1, 0);
  }, [text, typedWords]);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = window.setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = () => {
    stopTimer();
    setText("");
    setTime(0);
    setBackspaceCount(0);
    setSubmitted(false);
    setFinalResult(null);
    setStatus("Typing...");
    setIsSubmitting(false);
    setIsRunning(true);
  };

  const handleRestart = () => {
    stopTimer();
    setText("");
    setTime(0);
    setBackspaceCount(0);
    setSubmitted(false);
    setFinalResult(null);
    setStatus("Ready");
    setIsSubmitting(false);
    setIsRunning(false);
  };

  const buildFallbackResult = useCallback((): TypingResult => {
    const minutes = time > 0 ? time / 60 : 1 / 60;
    const wpm = Number((typedWords.length / minutes).toFixed(2));
    const accuracy = liveAccuracy;
    const errorCount = errors;

    let riskLevel = "Low";
    if (accuracy < 80 || wpm < 15) {
      riskLevel = "High";
    } else if (accuracy < 95 || wpm < 25) {
      riskLevel = "Medium";
    }

    return {
      wpm,
      accuracy,
      errors: errorCount,
      backspaceCount,
      backspace_count: backspaceCount,
      riskLevel,
      risk_level: riskLevel,
      summaryText: `Typing performance shows ${wpm} WPM with ${accuracy}% accuracy, ${errorCount} errors, and ${backspaceCount} backspaces.`,
      summary_text: `Typing performance shows ${wpm} WPM with ${accuracy}% accuracy, ${errorCount} errors, and ${backspaceCount} backspaces.`,
    };
  }, [time, typedWords.length, liveAccuracy, errors, backspaceCount]);

  const handleSubmit = useCallback(async () => {
    if (submitted || isSubmitting || !isRunning) return;

    stopTimer();
    setIsRunning(false);
    setSubmitted(true);
    setIsSubmitting(true);
    setStatus("Completed");

    const fallbackResult = buildFallbackResult();

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wpm: fallbackResult.wpm,
          accuracy: fallbackResult.accuracy,
          errors: fallbackResult.errors,
          backspaceCount: fallbackResult.backspaceCount,
          backspace_count: fallbackResult.backspace_count,
        }),
      });

      if (!response.ok) {
        throw new Error("Typing analysis request failed");
      }

      const data = await response.json();
      localStorage.setItem("typingResult", JSON.stringify(data));
      setFinalResult(data);
    } catch {
      localStorage.setItem("typingResult", JSON.stringify(fallbackResult));
      setFinalResult(fallbackResult);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitted, isSubmitting, isRunning, buildFallbackResult]);

  useEffect(() => {
    if (!isRunning || submitted) return;

    if (normalizeText(text) === normalizeText(PARAGRAPH)) {
      handleSubmit();
    }
  }, [text, isRunning, submitted, handleSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRunning || submitted) return;
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isRunning || submitted) return;

    if (e.key === "Backspace") {
      setBackspaceCount((prev) => prev + 1);
    }
  };

  const getWordClass = (word: string, index: number) => {
    const typedWord = typedWords[index];

    if (typedWord === undefined) {
      return index === currentWordIndex
        ? "bg-yellow-100 text-yellow-900 ring-2 ring-yellow-300"
        : "bg-green-50 text-gray-800";
    }

    if (typedWord === word) {
      return "bg-green-100 text-green-900";
    }

    return "bg-red-100 text-red-900";
  };

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-700">NeuroBehavior AI</h1>
          <p className="mt-3 text-xl text-gray-600">Advanced Typing Test</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Paragraph</h2>
            <p className="mt-1 text-sm text-gray-500">
              Start typing. The test auto-submits when you finish the sentence.
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              submitted
                ? "bg-green-100 text-green-700"
                : isRunning
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-gray-800 p-4 text-2xl leading-relaxed">
          {targetWords.map((word, index) => (
            <span
              key={index}
              className={`mr-2 mb-2 inline-block rounded px-2 py-1 transition ${getWordClass(word, index)}`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-600">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={handleStart}
            className="rounded-xl bg-green-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-green-700"
          >
            Start
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isRunning || submitted || isSubmitting}
            className="rounded-xl bg-gray-400 px-6 py-3 text-lg font-semibold text-white transition disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

          <button
            onClick={handleRestart}
            className="rounded-xl bg-slate-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-slate-700"
          >
            Restart
          </button>
        </div>

        <div className="mt-6 text-2xl font-semibold text-gray-800">
          Time: {time} sec
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-gray-800 p-4">
            <p className="text-sm text-gray-500">Typed Words</p>
            <p className="mt-2 text-4xl font-bold">{typedWords.length}</p>
          </div>

          <div className="rounded-2xl border-2 border-gray-800 p-4">
            <p className="text-sm text-gray-500">Live Accuracy</p>
            <p className="mt-2 text-4xl font-bold">{liveAccuracy.toFixed(2)}%</p>
          </div>

          <div className="rounded-2xl border-2 border-gray-800 p-4">
            <p className="text-sm text-gray-500">Live Errors</p>
            <p className="mt-2 text-4xl font-bold">{errors}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-3xl font-bold">Type Here</h2>
          <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!isRunning || submitted}
            placeholder="Click Start and begin typing here..."
            className="h-56 w-full rounded-2xl border-2 border-gray-800 p-4 text-2xl outline-none disabled:bg-gray-50"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xl font-semibold text-gray-700">
          <span>Backspace Count: {backspaceCount}</span>
          <span>Live WPM: {liveWpm}</span>
        </div>

        {finalResult && (
          <div className="mt-8 rounded-2xl border-2 border-gray-800 p-6">
            <h2 className="mb-4 text-4xl font-bold">Final Result</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">WPM</p>
                <p className="mt-2 text-4xl font-bold text-blue-700">{finalResult.wpm}</p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="mt-2 text-4xl font-bold text-green-700">{finalResult.accuracy}%</p>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-sm text-gray-500">Errors</p>
                <p className="mt-2 text-4xl font-bold text-rose-700">{finalResult.errors}</p>
              </div>

              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className="mt-2 text-4xl font-bold text-violet-700">{finalResult.riskLevel}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-300 p-4 text-gray-700">
              {finalResult.summaryText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;
