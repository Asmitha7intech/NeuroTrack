import { Link } from "react-router-dom";

function getStoredItem(key: string) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const typingResult = getStoredItem("typingResult");
  const attentionResult = getStoredItem("attentionResult");
  const readingResult = getStoredItem("readingResult");
  const finalResult = getStoredItem("finalResult");
  const predictionResult = getStoredItem("predictionResult");

  const completedModules = [typingResult, attentionResult, readingResult].filter(Boolean).length;
  const completionPercent = Math.round((completedModules / 3) * 100);

  const moduleCards = [
    {
      title: "Typing Test",
      description: "Measure typing speed, accuracy, and correction behavior.",
      path: "/typing-test",
      status: typingResult ? "Completed" : "Pending",
      gradient: "from-blue-600 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      title: "Attention Test",
      description: "Evaluate focus, reaction time, and impulsive responses.",
      path: "/attention-test",
      status: attentionResult ? "Completed" : "Pending",
      gradient: "from-fuchsia-600 to-violet-500",
      bg: "bg-fuchsia-50",
      text: "text-fuchsia-700",
    },
    {
      title: "Reading Test",
      description: "Check reading speed and comprehension performance.",
      path: "/reading-test",
      status: readingResult ? "Completed" : "Pending",
      gradient: "from-emerald-600 to-green-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <section className="overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top,_#4338ca,_#0f172a_60%)] p-8 text-white shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                Dashboard Overview
              </p>

              <h1 className="mt-5 text-5xl font-extrabold leading-tight">
                Welcome to your NeuroBehavior AI Dashboard
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
                Track module progress, continue assessments, access final AI-supported results,
                and review your saved insights from one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/typing-test"
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
                >
                  Continue Assessment
                </Link>

                <Link
                  to="/final-result"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Open Final Result
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Completion</p>
                <p className="mt-3 text-5xl font-extrabold">{completionPercent}%</p>
                <p className="mt-2 text-sm text-slate-200">{completedModules}/3 core modules completed</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Final Result</p>
                <p className="mt-3 text-2xl font-bold">
                  {finalResult ? "Available" : "Not Generated"}
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {finalResult ? "You can review your combined screening report." : "Complete modules to unlock final report."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">ML Prediction</p>
                <p className="mt-3 text-2xl font-bold">
                  {predictionResult ? (predictionResult.predictedRisk || predictionResult.predicted_risk || "Ready") : "Pending"}
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {predictionResult ? "Prediction and explanation available." : "Prediction will appear after analysis."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">History</p>
                <p className="mt-3 text-2xl font-bold">Profile-based</p>
                <p className="mt-2 text-sm text-slate-200">
                  Track and review your completed sessions over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {moduleCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`inline-flex rounded-full bg-gradient-to-r ${card.gradient} px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white`}>
                {card.status}
              </div>

              <h2 className={`mt-5 text-3xl font-extrabold ${card.text}`}>{card.title}</h2>
              <p className="mt-4 leading-7 text-slate-600">{card.description}</p>

              <div className={`mt-6 rounded-2xl ${card.bg} p-4`}>
                <p className="text-sm font-medium text-slate-600">Current Status</p>
                <p className={`mt-2 text-lg font-bold ${card.text}`}>{card.status}</p>
              </div>

              <Link
                to={card.path}
                className={`mt-6 inline-flex rounded-2xl bg-gradient-to-r ${card.gradient} px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]`}
              >
                Open {card.title}
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Progress Summary</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Assessment pipeline</h2>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Overall Completion</span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Typing Module</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${typingResult ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {typingResult ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Attention Module</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${attentionResult ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {attentionResult ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Reading Module</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${readingResult ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {readingResult ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Final Result</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${finalResult ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {finalResult ? "Available" : "Locked"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-600">Insights</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Quick access</h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
                <h3 className="text-2xl font-bold">Resume Testing</h3>
                <p className="mt-2 text-white/90">
                  Continue incomplete modules and move toward the combined result.
                </p>
                <Link
                  to="/typing-test"
                  className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950"
                >
                  Start Now
                </Link>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-500 p-6 text-white shadow-lg">
                <h3 className="text-2xl font-bold">Final AI Result</h3>
                <p className="mt-2 text-white/90">
                  Open the consolidated result with ML prediction and chatbot explanation.
                </p>
                <Link
                  to="/final-result"
                  className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950"
                >
                  View Final Result
                </Link>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-white shadow-lg">
                <h3 className="text-2xl font-bold">History Tracking</h3>
                <p className="mt-2 text-white/90">
                  Review saved sessions and compare outcomes over time.
                </p>
                <Link
                  to="/history"
                  className="mt-4 inline-flex rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950"
                >
                  Open History
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
