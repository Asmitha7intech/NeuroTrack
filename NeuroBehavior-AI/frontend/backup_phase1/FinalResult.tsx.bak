import { isLoggedIn } from "../utils/auth";
import { saveHistoryToBackend } from "../utils/historyApi";
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { downloadPdfReport } from "../api";
import HistoryAutoSaver from "../components/HistoryAutoSaver";

type AnyObj = Record<string, any>;

const getValue = (obj: AnyObj | null | undefined, keys: string[], fallback: any = 0) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

async function saveCompletedSessionToBackend(
  typingResult: any,
  attentionResult: any,
  readingResult: any,
  finalResult: any,
  predictionResult: any
) {
  if (!isLoggedIn()) return;

  try {
    await saveHistoryToBackend({
      session_label: `Session ${new Date().toLocaleString()}`,
      typing_result: typingResult,
      attention_result: attentionResult,
      reading_result: readingResult,
      final_result: finalResult,
      prediction_result: predictionResult,
    });
  } catch (error) {
    console.error("Backend history save failed:", error);
  }
}

const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-6 shadow-lg";
const statBoxClass =
  "rounded-2xl bg-slate-50 p-4 border border-slate-100";

const FinalResult: React.FC = () => {
  const [typingResult, setTypingResult] = useState<AnyObj | null>(null);
  const [attentionResult, setAttentionResult] = useState<AnyObj | null>(null);
  const [readingResult, setReadingResult] = useState<AnyObj | null>(null);

  const [finalResult, setFinalResult] = useState<AnyObj | null>(null);
  const [predictionResult, setPredictionResult] = useState<AnyObj | null>(null);

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const typing = localStorage.getItem("typingResult");
    const attention = localStorage.getItem("attentionResult");
    const reading = localStorage.getItem("readingResult");
    const savedFinal = localStorage.getItem("finalResult");
    const savedPrediction = localStorage.getItem("predictionResult");

    setTypingResult(typing ? JSON.parse(typing) : null);
    setAttentionResult(attention ? JSON.parse(attention) : null);
    setReadingResult(reading ? JSON.parse(reading) : null);
    setFinalResult(savedFinal ? JSON.parse(savedFinal) : null);
    setPredictionResult(savedPrediction ? JSON.parse(savedPrediction) : null);
  }, []);

  useEffect(() => {
    const fetchFinalAndPrediction = async () => {
      if (!typingResult && !attentionResult && !readingResult) return;

      const payload = {
        typingResult,
        attentionResult,
        readingResult,
      };

      let finalResultData: AnyObj | null = null;
      let predictionResultData: AnyObj | null = null;

      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/analyze-final", {
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
        finalResultData = data;
        setFinalResult(data);
        localStorage.setItem("finalResult", JSON.stringify(data));
      } catch (error) {
        console.error("Final result API error:", error);
      } finally {
        setLoading(false);
      }

      setMlLoading(true);
      try {
        const predictionResponse = await fetch("http://127.0.0.1:8000/predict-behavior", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!predictionResponse.ok) {
          const text = await predictionResponse.text();
          throw new Error(text);
        }

        const predictionData = await predictionResponse.json();
        predictionResultData = predictionData;
        setPredictionResult(predictionData);
        localStorage.setItem("predictionResult", JSON.stringify(predictionData));
      } catch (error) {
        console.error("ML prediction API error:", error);
      } finally {
        setMlLoading(false);
      }

      if (finalResultData && predictionResultData) {
        await saveCompletedSessionToBackend(
          typingResult,
          attentionResult,
          readingResult,
          finalResultData,
          predictionResultData
        );
      }
    };

    fetchFinalAndPrediction();
  }, [typingResult, attentionResult, readingResult]);

  const handleAskAssistant = async () => {
    if (!chatQuestion.trim()) return;

    setChatLoading(true);
    setChatAnswer("");

    try {
      const response = await fetch("http://127.0.0.1:8000/chat-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: chatQuestion,
          typingResult,
          attentionResult,
          readingResult,
          finalResult,
          mlResult: predictionResult,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      setChatAnswer(getValue(data, ["answer"], "No response received."));
    } catch (error) {
      console.error("Chat assistant API error:", error);
      setChatAnswer("Sorry, something went wrong while contacting the AI assistant.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await downloadPdfReport({
        typing_result: typingResult || {},
        attention_result: attentionResult || {},
        reading_result: readingResult || {},
        final_result: finalResult || {},
        prediction_result: predictionResult || {},
      });
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to download PDF report");
    }
  };

  const overallScore = getValue(finalResult, ["overallScore", "overall_score"], 0);
  const overallRisk = getValue(finalResult, ["overallRisk", "overall_risk"], "N/A");
  const dominantConcernArea = getValue(
    finalResult,
    ["dominantConcernArea", "dominant_concern_area"],
    "balanced"
  );
  const finalSummary = getValue(finalResult, ["finalSummary", "final_summary"], "");
  const recommendation = getValue(finalResult, ["recommendation"], "");

  const typingScore =
    getValue(finalResult, ["typingScore", "typing_score"], null) ??
    Math.min(
      100,
      Number(getValue(typingResult, ["accuracy"], 0)) * 0.7 +
        Math.min(Number(getValue(typingResult, ["wpm"], 0)), 60) * 0.5
    );

  const attentionScore =
    getValue(finalResult, ["attentionScore", "attention_score"], null) ??
    Math.min(
      100,
      Number(getValue(attentionResult, ["attentionScore", "attention_score", "score"], 0))
    );

  const readingScore =
    getValue(finalResult, ["readingScore", "reading_score"], null) ??
    Math.min(
      100,
      Number(getValue(readingResult, ["comprehensionScore", "comprehension_score"], 0)) * 0.75 +
        Math.min(Number(getValue(readingResult, ["readingSpeed", "reading_speed", "wpm"], 0)), 200) * 0.15
    );

  const barData = useMemo(
    () => [
      { name: "Typing", value: Number(typingScore || 0) },
      { name: "Attention", value: Number(attentionScore || 0) },
      { name: "Reading", value: Number(readingScore || 0) },
    ],
    [typingScore, attentionScore, readingScore]
  );

  const radarData = useMemo(
    () => [
      { subject: "Typing", value: Number(typingScore || 0), fullMark: 100 },
      { subject: "Attention", value: Number(attentionScore || 0), fullMark: 100 },
      { subject: "Reading", value: Number(readingScore || 0), fullMark: 100 },
      { subject: "Focus", value: Number(attentionScore || 0), fullMark: 100 },
      {
        subject: "Speed",
        value: Number(getValue(readingResult, ["readingSpeed", "reading_speed", "wpm"], 0)),
        fullMark: 200,
      },
    ],
    [typingScore, attentionScore, readingScore, readingResult]
  );

  const predictedRisk = getValue(predictionResult, ["predictedRisk", "predicted_risk"], "N/A");
  const predictionConfidence = getValue(predictionResult, ["confidence"], 0);
  const predictionSummary = getValue(predictionResult, ["summaryText", "summary_text"], "");
  const predictionExplanation = getValue(predictionResult, ["explanation"], []);
  const probabilities = getValue(predictionResult, ["probabilities"], {});

  return (
    <>
      <HistoryAutoSaver />

      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top,_#4f46e5,_#0f172a_60%)] p-8 text-white shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                  Final Behavioral Report
                </p>

                <h1 className="mt-5 text-5xl font-extrabold leading-tight">
                  Unified result with AI and ML-supported interpretation
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                  Review your consolidated typing, attention, and reading analysis with
                  overall score, dominant concern area, machine prediction, chatbot support,
                  and downloadable PDF report.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={handleDownloadReport}
                    className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
                  >
                    Download PDF Report
                  </button>

                  <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white">
                    {loading || mlLoading ? "Refreshing analysis..." : "Analysis Ready"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Overall Score</p>
                  <p className="mt-3 text-5xl font-extrabold">{overallScore}%</p>
                  <p className="mt-2 text-sm text-slate-200">Combined performance indicator</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Overall Risk</p>
                  <p className="mt-3 text-3xl font-bold">{overallRisk}</p>
                  <p className="mt-2 text-sm text-slate-200">Final behavioral screening level</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Concern Area</p>
                  <p className="mt-3 text-2xl font-bold capitalize">{dominantConcernArea}</p>
                  <p className="mt-2 text-sm text-slate-200">Lowest-performing domain</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">ML Prediction</p>
                  <p className="mt-3 text-2xl font-bold">{predictedRisk}</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Confidence: {predictionConfidence}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <div className={`${cardClass} lg:col-span-2`}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
                Final Summary
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Overall interpretation</h2>
              <p className="mt-5 leading-8 text-slate-600">
                {loading ? "Loading report..." : finalSummary || "No summary available yet."}
              </p>

              <div className="mt-6 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                Dominant Concern Area: {dominantConcernArea}
              </div>
            </div>

            <div className={cardClass}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Report Status
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Modules completed</h2>

              <div className="mt-6 space-y-4">
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Completed Modules</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {[typingResult, attentionResult, readingResult].filter(Boolean).length}/3
                  </p>
                </div>

                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Typing Module</p>
                  <p className={`mt-2 text-lg font-bold ${typingResult ? "text-green-700" : "text-amber-700"}`}>
                    {typingResult ? "Available" : "Missing"}
                  </p>
                </div>

                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Attention Module</p>
                  <p className={`mt-2 text-lg font-bold ${attentionResult ? "text-green-700" : "text-amber-700"}`}>
                    {attentionResult ? "Available" : "Missing"}
                  </p>
                </div>

                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Reading Module</p>
                  <p className={`mt-2 text-lg font-bold ${readingResult ? "text-green-700" : "text-amber-700"}`}>
                    {readingResult ? "Available" : "Missing"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <div className={cardClass}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Comparison
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Module scores</h2>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${cardClass} lg:col-span-2`}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-600">
                Radar Analysis
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Performance spread</h2>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar dataKey="value" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                    Module 1
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-blue-700">Typing Analysis</h2>
                </div>
                <div className="rounded-full bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700">
                  Typing
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">WPM</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">{getValue(typingResult, ["wpm"], 0)}</p>
                </div>
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Accuracy</p>
                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {getValue(typingResult, ["accuracy"], 0)}%
                  </p>
                </div>
                <div className={`col-span-2 ${statBoxClass}`}>
                  <p className="text-sm text-slate-500">Errors</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{getValue(typingResult, ["errors"], 0)}</p>
                </div>
              </div>

              <div className="mt-5 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                {getValue(typingResult, ["riskLevel", "risk_level"], "N/A")} Risk
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Summary</p>
                <p className="mt-2 leading-7 text-slate-700">
                  {getValue(typingResult, ["summaryText", "summary_text"], "")}
                </p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-600">
                    Module 2
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-fuchsia-700">Attention Analysis</h2>
                </div>
                <div className="rounded-full bg-fuchsia-100 px-3 py-2 text-xs font-bold text-fuchsia-700">
                  Attention
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Attention Score</p>
                  <p className="mt-2 text-3xl font-bold text-fuchsia-700">
                    {getValue(attentionResult, ["attentionScore", "attention_score", "score"], 0)}
                  </p>
                </div>
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Reaction Time</p>
                  <p className="mt-2 text-3xl font-bold text-fuchsia-700">
                    {getValue(attentionResult, ["reactionTime", "reaction_time"], 0)} ms
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                  Focus: {getValue(attentionResult, ["focusLevel", "focus_level"], "N/A")}
                </span>
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Impulsivity: {getValue(attentionResult, ["impulsivityLevel", "impulsivity_level"], "N/A")}
                </span>
              </div>

              <div className="mt-5 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                {getValue(attentionResult, ["riskLevel", "risk_level"], "N/A")} Risk
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Summary</p>
                <p className="mt-2 leading-7 text-slate-700">
                  {getValue(
                    attentionResult,
                    ["summaryText", "summary_text", "behaviorSummary", "behavior_summary"],
                    ""
                  )}
                </p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
                    Module 3
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-emerald-700">Reading Analysis</h2>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
                  Reading
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Reading Speed</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {getValue(readingResult, ["readingSpeed", "reading_speed", "wpm"], 0)} WPM
                  </p>
                </div>
                <div className={statBoxClass}>
                  <p className="text-sm text-slate-500">Comprehension</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {getValue(readingResult, ["comprehensionScore", "comprehension_score"], 0)}%
                  </p>
                </div>
                <div className={`col-span-2 ${statBoxClass}`}>
                  <p className="text-sm text-slate-500">Correct Answers</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {getValue(readingResult, ["correctAnswers", "correct_answers"], 0)}/3
                  </p>
                </div>
              </div>

              <div className="mt-5 inline-flex rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                {getValue(
                  readingResult,
                  ["readingRisk", "reading_risk", "riskLevel", "risk_level"],
                  "N/A"
                )} Risk
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Summary</p>
                <p className="mt-2 leading-7 text-slate-700">
                  {getValue(readingResult, ["summaryText", "summary_text"], "")}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-3">
            <div className={`${cardClass} lg:col-span-2`}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
                ML Prediction
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Prediction output</h2>

              {mlLoading ? (
                <p className="mt-6 text-slate-600">Loading ML prediction...</p>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className={statBoxClass}>
                      <p className="text-sm text-slate-500">Predicted Risk</p>
                      <p className="mt-2 text-2xl font-bold text-violet-700">{predictedRisk}</p>
                    </div>

                    <div className={statBoxClass}>
                      <p className="text-sm text-slate-500">Confidence</p>
                      <p className="mt-2 text-2xl font-bold text-blue-700">{predictionConfidence}%</p>
                    </div>

                    <div className={statBoxClass}>
                      <p className="text-sm text-slate-500">Low Probability</p>
                      <p className="mt-2 text-xl font-bold text-green-700">
                        {getValue(probabilities, ["Low", "low"], 0)}%
                      </p>
                    </div>

                    <div className={statBoxClass}>
                      <p className="text-sm text-slate-500">High Probability</p>
                      <p className="mt-2 text-xl font-bold text-rose-700">
                        {getValue(probabilities, ["High", "high"], 0)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Prediction Summary</p>
                    <p className="mt-2 leading-7 text-slate-700">{predictionSummary}</p>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">AI Explanation</p>
                    {Array.isArray(predictionExplanation) && predictionExplanation.length > 0 ? (
                      <ul className="mt-3 list-disc pl-5 text-slate-700 space-y-2">
                        {predictionExplanation.map((item: any, index: number) => (
                          <li key={index}>
                            {typeof item === "string" ? item : JSON.stringify(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-slate-700">No explanation available.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
                Recommendation
              </p>
              <h2 className="mt-3 text-3xl font-extrabold">Final guidance</h2>
              <p className="mt-5 leading-8 text-white/90">
                {recommendation || "No recommendation available yet."}
              </p>
            </div>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
              AI Assistant
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Ask about your report</h2>
            <p className="mt-3 text-slate-600">
              Ask about your typing, attention, reading, final result, or improvement plan.
            </p>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row">
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Example: How can I improve my attention score?"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              />
              <button
                onClick={handleAskAssistant}
                disabled={chatLoading}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
              >
                {chatLoading ? "Asking..." : "Ask AI"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Assistant Response</p>
              <p className="mt-3 leading-7 text-slate-700">
                {chatAnswer || "No question asked yet."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default FinalResult;
