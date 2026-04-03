import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

type AnyObj = Record<string, any>;

const getValue = (obj: AnyObj | null | undefined, keys: string[], fallback: any = 0) => {
  if (!obj) return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

function Dashboard() {
  const [typing, setTyping] = useState<AnyObj | null>(null);
  const [attention, setAttention] = useState<AnyObj | null>(null);
  const [reading, setReading] = useState<AnyObj | null>(null);

  const [finalAnalysis, setFinalAnalysis] = useState<AnyObj | null>(null);
  const [mlPrediction, setMlPrediction] = useState<AnyObj | null>(null);

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    const typingData = localStorage.getItem("typingResult");
    const attentionData = localStorage.getItem("attentionResult");
    const readingData = localStorage.getItem("readingResult");

    setTyping(typingData ? JSON.parse(typingData) : null);
    setAttention(attentionData ? JSON.parse(attentionData) : null);
    setReading(readingData ? JSON.parse(readingData) : null);
  }, []);

  useEffect(() => {
    const fetchFinalAnalysis = async () => {
      if (!typing && !attention && !reading) {
        setFinalAnalysis(null);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch("http://127.0.0.1:8000/analyze-final", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            typingResult: typing,
            attentionResult: attention,
            readingResult: reading,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.json();
        setFinalAnalysis(data);
      } catch (error) {
        console.error("Final Analysis API Error:", error);
        setFinalAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalAnalysis();
  }, [typing, attention, reading]);

  useEffect(() => {
    const fetchMlPrediction = async () => {
      if (!typing && !attention && !reading) {
        setMlPrediction(null);
        return;
      }

      try {
        setMlLoading(true);

        const response = await fetch("http://127.0.0.1:8000/predict-behavior", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            typingResult: typing,
            attentionResult: attention,
            readingResult: reading,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const data = await response.json();
        setMlPrediction(data);
      } catch (error) {
        console.error("ML Prediction API Error:", error);
        setMlPrediction(null);
      } finally {
        setMlLoading(false);
      }
    };

    fetchMlPrediction();
  }, [typing, attention, reading]);

  const completedModules = useMemo(() => {
    return [typing, attention, reading].filter(Boolean).length;
  }, [typing, attention, reading]);

  const badgeClass = (value: string) => {
    if (value === "Low" || value === "low") return "bg-green-100 text-green-700 border-green-200";
    if (value === "Medium" || value === "Moderate" || value === "medium")
      return "bg-orange-100 text-orange-700 border-orange-200";
    if (value === "High" || value === "high") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const typingAccuracy = Number(getValue(typing, ["accuracy"], 0));
  const typingWpm = Number(getValue(typing, ["wpm"], 0));
  const typingErrors = Number(getValue(typing, ["errors"], 0));
  const typingRisk = getValue(typing, ["risk_level", "riskLevel"], "Not Available");
  const typingSummary = getValue(typing, ["summary_text", "summaryText"], "");

  const attentionScore = Number(
    getValue(attention, ["attention_score", "attentionScore", "score"], 0)
  );
  const attentionRisk = getValue(attention, ["risk_level", "riskLevel"], "Not Available");
  const attentionSummary = getValue(
    attention,
    ["summary_text", "summaryText", "behavior_summary", "behaviorSummary"],
    ""
  );
  const attentionFocus = getValue(attention, ["focus_level", "focusLevel"], "Not Available");
  const attentionImpulsivity = getValue(
    attention,
    ["impulsivity_level", "impulsivityLevel"],
    "Not Available"
  );
  const attentionReactionTime = Number(
    getValue(attention, ["reaction_time", "reactionTime", "avg_reaction_time", "avgReactionTime"], 0)
  );
  const attentionAccuracy = Number(getValue(attention, ["accuracy"], 0));

  const readingSpeed = Number(getValue(reading, ["reading_speed", "readingSpeed", "wpm"], 0));
  const readingComprehension = Number(
    getValue(reading, ["comprehension_score", "comprehensionScore"], 0)
  );
  const readingCorrectAnswers = Number(
    getValue(reading, ["correct_answers", "correctAnswers"], 0)
  );
  const readingRisk = getValue(
    reading,
    ["reading_risk", "readingRisk", "risk_level", "riskLevel"],
    "Not Available"
  );
  const readingSummary = getValue(reading, ["summary_text", "summaryText"], "");

  const overallScore = Number(getValue(finalAnalysis, ["overall_score", "overallScore"], 0));
  const overallRisk = getValue(finalAnalysis, ["overall_risk", "overallRisk"], "Not Available");
  const dominantConcernArea = getValue(
    finalAnalysis,
    ["dominant_concern_area", "dominantConcernArea"],
    "balanced"
  );
  const finalSummary = getValue(finalAnalysis, ["final_summary", "finalSummary"], "");
  const recommendation = getValue(finalAnalysis, ["recommendation"], "");

  const finalTypingScore = Number(
    getValue(finalAnalysis, ["typing_score", "typingScore"], Math.min(100, typingAccuracy))
  );
  const finalAttentionScore = Number(
    getValue(finalAnalysis, ["attention_score", "attentionScore"], Math.min(100, attentionScore))
  );
  const finalReadingScore = Number(
    getValue(
      finalAnalysis,
      ["reading_score", "readingScore"],
      Math.min(100, readingComprehension)
    )
  );

  const mlPredictedRisk = getValue(mlPrediction, ["predicted_risk", "predictedRisk"], "Not Available");
  const mlConfidence = Number(getValue(mlPrediction, ["confidence"], 0));
  const mlSummary = getValue(mlPrediction, ["summary_text", "summaryText"], "");
  const mlProbabilities = getValue(mlPrediction, ["probabilities"], {});

  const mlLow = Number(getValue(mlProbabilities, ["low", "Low"], 0));
  const mlMedium = Number(getValue(mlProbabilities, ["medium", "Medium"], 0));
  const mlHigh = Number(getValue(mlProbabilities, ["high", "High"], 0));

  const scoreChartData = [
    { name: "Typing", score: finalTypingScore },
    { name: "Attention", score: finalAttentionScore },
    { name: "Reading", score: finalReadingScore },
  ];

  const radarData = [
    { subject: "Typing", value: finalTypingScore },
    { subject: "Attention", value: finalAttentionScore },
    { subject: "Reading", value: finalReadingScore },
    { subject: "Focus", value: Math.min(100, attentionAccuracy) },
    { subject: "Speed", value: Math.min(100, Math.round(readingSpeed / 2)) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-8">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-10 text-white">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/80">
            NeuroBehavior AI Report
          </p>
          <h1 className="mb-3 text-5xl font-bold">Final Result</h1>
          <p className="max-w-3xl text-lg text-white/90">
            Consolidated interpretation of typing behavior, attention control,
            and reading comprehension performance.
          </p>
        </div>

        <div className="p-8">
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-7 lg:col-span-2">
              <p className="mb-2 text-sm text-gray-500">Overall Performance Score</p>
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <p className="text-6xl font-bold text-purple-600">
                  {finalAnalysis ? `${overallScore}%` : "-"}
                </p>
                <div
                  className={`rounded-full border px-4 py-2 font-semibold ${badgeClass(
                    overallRisk
                  )}`}
                >
                  {finalAnalysis ? `${overallRisk} Risk` : "Not Available"}
                </div>
              </div>

              {loading && <p className="text-lg text-gray-700">Generating final analysis...</p>}

              {!loading && finalAnalysis && (
                <>
                  <p className="mb-4 text-lg leading-8 text-gray-700">{finalSummary}</p>
                  <div className="inline-flex rounded-full border bg-white px-4 py-2 font-semibold text-gray-800">
                    Dominant Concern Area: {dominantConcernArea}
                  </div>
                </>
              )}

              {!loading && !finalAnalysis && (
                <p className="text-lg leading-8 text-gray-700">
                  Final analysis is not available yet. Complete the modules to generate the full report.
                </p>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-gray-800">Report Status</h2>

              <div className="space-y-4">
                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Modules Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{completedModules}/3</p>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Typing Module</p>
                  <p className="text-xl font-bold text-blue-600">{typing ? "Available" : "Pending"}</p>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Attention Module</p>
                  <p className="text-xl font-bold text-purple-600">
                    {attention ? "Available" : "Pending"}
                  </p>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Reading Module</p>
                  <p className="text-xl font-bold text-green-600">{reading ? "Available" : "Pending"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border bg-gradient-to-r from-slate-50 to-blue-50 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">AI-Powered Behavioral Prediction</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                Phase 3 ML
              </span>
            </div>

            {mlLoading && <p className="text-lg text-gray-700">Generating ML prediction...</p>}

            {!mlLoading && mlPrediction && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Predicted Risk</p>
                    <div className={`mt-3 inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(mlPredictedRisk)}`}>
                      {mlPredictedRisk}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="mt-2 text-3xl font-bold text-blue-700">{mlConfidence}%</p>
                  </div>

                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-gray-500">Prediction Type</p>
                    <p className="mt-2 text-lg font-semibold text-gray-800">ML Screening Layer</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border bg-white p-5">
                  <p className="mb-4 text-sm text-gray-500">Probability Breakdown</p>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Low</span>
                        <span>{mlLow}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{ width: `${mlLow}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Medium</span>
                        <span>{mlMedium}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200">
                        <div
                          className="h-3 rounded-full bg-orange-500"
                          style={{ width: `${mlMedium}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>High</span>
                        <span>{mlHigh}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200">
                        <div
                          className="h-3 rounded-full bg-red-500"
                          style={{ width: `${mlHigh}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border bg-white p-5">
                  <p className="mb-2 text-sm text-gray-500">ML Summary</p>
                  <p className="text-gray-700">{mlSummary}</p>
                </div>
              </>
            )}

            {!mlLoading && !mlPrediction && (
              <p className="text-gray-700">
                ML prediction is not available yet. Complete the modules and ensure the model is loaded.
              </p>
            )}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-gray-800">Module Score Comparison</h2>
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-gray-800">Performance Radar</h2>
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar dataKey="value" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold text-gray-800">Risk Overview</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="mb-2 text-sm text-gray-500">Typing Risk</p>
                <div
                  className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                    typingRisk
                  )}`}
                >
                  {typing ? typingRisk : "Not Available"}
                </div>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <p className="mb-2 text-sm text-gray-500">Attention Risk</p>
                <div
                  className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                    attentionRisk
                  )}`}
                >
                  {attention ? attentionRisk : "Not Available"}
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                <p className="mb-2 text-sm text-gray-500">Reading Risk</p>
                <div
                  className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                    readingRisk
                  )}`}
                >
                  {reading ? readingRisk : "Not Available"}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-blue-600">Typing Analysis</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  Module 1
                </span>
              </div>

              {typing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">WPM</p>
                      <p className="text-2xl font-bold text-blue-600">{typingWpm}</p>
                    </div>
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Accuracy</p>
                      <p className="text-2xl font-bold text-blue-600">{typingAccuracy}%</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Errors</p>
                    <p className="text-xl font-bold text-gray-800">{typingErrors}</p>
                  </div>

                  <div
                    className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                      typingRisk
                    )}`}
                  >
                    {typingRisk} Risk
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <p className="mb-2 text-sm text-gray-500">Summary</p>
                    <p className="text-gray-700">{typingSummary}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Typing analysis is not available yet.</p>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-purple-600">Attention Analysis</h2>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                  Module 2
                </span>
              </div>

              {attention ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Attention Score</p>
                      <p className="text-2xl font-bold text-purple-600">{attentionScore}</p>
                    </div>
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Reaction Time</p>
                      <p className="text-2xl font-bold text-purple-600">{attentionReactionTime} ms</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${badgeClass(
                        attentionFocus
                      )}`}
                    >
                      Focus: {attentionFocus}
                    </span>
                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${badgeClass(
                        attentionImpulsivity
                      )}`}
                    >
                      Impulsivity: {attentionImpulsivity}
                    </span>
                  </div>

                  <div
                    className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                      attentionRisk
                    )}`}
                  >
                    {attentionRisk} Risk
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <p className="mb-2 text-sm text-gray-500">Summary</p>
                    <p className="text-gray-700">{attentionSummary}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Attention analysis is not available yet.</p>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-600">Reading Analysis</h2>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  Module 3
                </span>
              </div>

              {reading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Reading Speed</p>
                      <p className="text-2xl font-bold text-green-600">{readingSpeed} WPM</p>
                    </div>
                    <div className="rounded-2xl border bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Comprehension</p>
                      <p className="text-2xl font-bold text-green-600">{readingComprehension}%</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Correct Answers</p>
                    <p className="text-xl font-bold text-gray-800">{readingCorrectAnswers}/3</p>
                  </div>

                  <div
                    className={`inline-flex rounded-full border px-4 py-2 font-semibold ${badgeClass(
                      readingRisk
                    )}`}
                  >
                    {readingRisk} Risk
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <p className="mb-2 text-sm text-gray-500">Summary</p>
                    <p className="text-gray-700">{readingSummary}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Reading analysis is not available yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">Final Recommendation</h2>

            {loading && <p className="text-lg leading-8 text-gray-700">Generating recommendation...</p>}

            {!loading && finalAnalysis && (
              <p className="text-lg leading-8 text-gray-700">{recommendation}</p>
            )}

            {!loading && !finalAnalysis && (
              <p className="text-lg leading-8 text-gray-700">
                Complete the modules to receive a recommendation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;