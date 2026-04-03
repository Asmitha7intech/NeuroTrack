import React, { useEffect, useMemo, useRef, useState } from "react";

type ReadingResult = {
  reading_speed?: number;
  readingSpeed?: number;
  wpm?: number;
  comprehension_score?: number;
  comprehensionScore?: number;
  correct_answers?: number;
  correctAnswers?: number;
  reading_risk?: string;
  readingRisk?: string;
  summary_text?: string;
  summaryText?: string;
};

const passage = `Riya loved visiting the library every Saturday morning. She enjoyed reading storybooks, science magazines, and short biographies of famous people. One day, she found a book about space exploration. She learned how astronauts travel beyond Earth and how satellites help people communicate across long distances. After reading for an hour, Riya borrowed the book and went home excited to share what she had learned with her brother.`;

const questions = [
  {
    id: 1,
    question: "Where did Riya go every Saturday morning?",
    options: ["Park", "Library", "School", "Museum"],
    answer: "Library",
  },
  {
    id: 2,
    question: "What topic made Riya excited?",
    options: ["Cooking", "Music", "Space exploration", "Painting"],
    answer: "Space exploration",
  },
  {
    id: 3,
    question: "Who did Riya want to share her learning with?",
    options: ["Her brother", "Her teacher", "Her mother", "Her friend"],
    answer: "Her brother",
  },
];

const ReadingTest: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ReadingResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    if (started && !readingDone && startTimeRef.current) {
      timer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setSeconds(elapsed);
      }, 500);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [started, readingDone]);

  const wordCount = useMemo(() => {
    return passage.trim().split(/\s+/).length;
  }, []);

  const handleStart = () => {
    setStarted(true);
    setReadingDone(false);
    setSeconds(0);
    setAnswers({});
    setResult(null);
    startTimeRef.current = Date.now();
    endTimeRef.current = null;
  };

  const handleFinish = () => {
    if (!started || !startTimeRef.current) return;
    endTimeRef.current = Date.now();
    const elapsed = Math.max(1, Math.floor((endTimeRef.current - startTimeRef.current) / 1000));
    setSeconds(elapsed);
    setReadingDone(true);
  };

  const handleReset = () => {
    setStarted(false);
    setReadingDone(false);
    setSeconds(0);
    setAnswers({});
    setResult(null);
    startTimeRef.current = null;
    endTimeRef.current = null;
    localStorage.removeItem("readingResult");
  };

  const handleAnswerChange = (qid: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!started || !startTimeRef.current) {
      alert("Please start the reading test first.");
      return;
    }

    if (!readingDone) {
      alert("Please click Finish Reading before submitting.");
      return;
    }

    const answeredCount = Object.keys(answers).length;
    if (answeredCount !== questions.length) {
      alert("Please answer all questions.");
      return;
    }

    const correctAnswers = questions.filter((q) => answers[q.id] === q.answer).length;
    const durationSeconds = Math.max(
      1,
      Math.floor(((endTimeRef.current ?? Date.now()) - startTimeRef.current) / 1000)
    );

    const readingSpeed = Number(((wordCount / durationSeconds) * 60).toFixed(2));
    const comprehensionScore = Number(((correctAnswers / questions.length) * 100).toFixed(2));

    const payload = {
      passage_text: passage,
      time_taken: durationSeconds,
      total_questions: questions.length,
      correct_answers: correctAnswers,
      reading_speed: readingSpeed,
      comprehension_score: comprehensionScore,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      setResult(data);
      localStorage.setItem("readingResult", JSON.stringify(data));
      alert("Reading test submitted successfully.");
    } catch (error) {
      console.error("Reading API error:", error);
      alert("Could not connect to backend.");
    }
  };

  const readingSpeedValue = result?.readingSpeed ?? result?.reading_speed ?? result?.wpm ?? 0;
  const comprehensionValue = result?.comprehensionScore ?? result?.comprehension_score ?? 0;
  const correctAnswersValue = result?.correctAnswers ?? result?.correct_answers ?? 0;
  const readingRiskValue = result?.readingRisk ?? result?.reading_risk ?? "";
  const summaryValue = result?.summaryText ?? result?.summary_text ?? "";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-lg">
        <div className="mb-6 rounded-2xl bg-emerald-500 p-5 text-white">
          <h1 className="text-3xl font-bold">Reading Test</h1>
          <p className="mt-2 text-sm">
            Measure reading speed and comprehension performance
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-2 border-gray-800 p-4">
            <p className="text-xs text-gray-500">Timer</p>
            <p className="text-2xl font-bold text-blue-700">{seconds}s</p>
          </div>
          <div className="rounded-xl border-2 border-gray-800 p-4">
            <p className="text-xs text-gray-500">Started</p>
            <p className="text-lg font-semibold text-blue-700">{started ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-xl border-2 border-gray-800 p-4">
            <p className="text-xs text-gray-500">Reading Done</p>
            <p className="text-lg font-semibold text-blue-700">{readingDone ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-xl border-2 border-gray-800 p-4">
            <p className="text-xs text-gray-500">Answered</p>
            <p className="text-lg font-semibold text-orange-600">
              {Object.keys(answers).length}/{questions.length}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleStart}
            className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Start Reading
          </button>
          <button
            onClick={handleFinish}
            disabled={!started || readingDone}
            className="rounded-xl bg-gray-200 px-4 py-2 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Finish Reading
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl bg-gray-200 px-4 py-2 font-semibold text-gray-700"
          >
            Reset
          </button>
        </div>

        <div className="mb-6 rounded-2xl border-2 border-gray-800 p-4">
          <h2 className="mb-3 text-xl font-bold">Passage</h2>
          <p className="leading-8 text-gray-700">{passage}</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-800 p-4">
          <h2 className="mb-4 text-xl font-bold">Comprehension Questions</h2>

          <div className="space-y-5">
            {questions.map((q) => (
              <div key={q.id} className="rounded-2xl border-2 border-gray-800 p-4">
                <p className="mb-4 font-semibold">
                  {q.id}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {q.options.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-gray-800 px-3 py-3"
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => handleAnswerChange(q.id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
          >
            Submit Reading Test
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="mb-4 text-3xl font-bold text-emerald-700">Reading Analysis</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border-2 border-gray-800 p-4">
              <p className="text-xs text-gray-500">Reading Speed</p>
              <p className="text-3xl font-bold text-blue-700">{readingSpeedValue} WPM</p>
            </div>

            <div className="rounded-xl border-2 border-gray-800 p-4">
              <p className="text-xs text-gray-500">Comprehension Score</p>
              <p className="text-3xl font-bold text-fuchsia-700">{comprehensionValue}%</p>
            </div>

            <div className="rounded-xl border-2 border-gray-800 p-4">
              <p className="text-xs text-gray-500">Correct Answers</p>
              <p className="text-3xl font-bold text-orange-600">
                {correctAnswersValue}/{questions.length}
              </p>
            </div>

            <div className="rounded-xl border-2 border-gray-800 p-4">
              <p className="text-xs text-gray-500">Reading Risk</p>
              <p className="text-3xl font-bold text-rose-600">{readingRiskValue}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border-2 border-gray-800 p-4">
            <p className="text-xs text-gray-500">Summary</p>
            <p className="mt-2 text-gray-700">{summaryValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingTest;
