import { Link } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const features = [
  {
    title: "Typing Analysis",
    subtitle: "Module 1",
    color: "from-blue-500 to-cyan-500",
    textColor: "text-blue-700",
    description:
      "Analyze speed, typing accuracy, correction patterns, and written interaction behavior.",
    path: "/typing-test",
    button: "Start Typing Test",
  },
  {
    title: "Attention Analysis",
    subtitle: "Module 2",
    color: "from-fuchsia-500 to-violet-500",
    textColor: "text-fuchsia-700",
    description:
      "Measure focus level, impulsive responses, reaction time, and selective attention control.",
    path: "/attention-test",
    button: "Start Attention Test",
  },
  {
    title: "Reading Analysis",
    subtitle: "Module 3",
    color: "from-emerald-500 to-green-500",
    textColor: "text-emerald-700",
    description:
      "Evaluate reading speed, passage understanding, and comprehension performance.",
    path: "/reading-test",
    button: "Start Reading Test",
  },
];

const steps = [
  "Create your account or log in",
  "Complete Typing, Attention, and Reading tests",
  "Generate your final behavioral screening result",
  "Review AI prediction and chatbot explanation",
  "Track your saved session history over time",
];

const outputs = [
  "Typing: speed, accuracy, errors, typing risk",
  "Attention: score, focus level, impulsivity level",
  "Reading: speed, comprehension score, reading risk",
  "Final Result: overall score, concern area, recommendation",
  "ML Layer: predicted risk, confidence, explanation",
];

export default function Home() {
  const loggedIn = isLoggedIn();

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_#4338ca,_#0f172a_55%)] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-fuchsia-500 blur-3xl" />
          <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                NeuroBehavior AI
              </div>

              <h1 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl">
                AI-powered behavioral screening with a modern interactive experience
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                NeuroBehavior AI evaluates typing behavior, attention control, and reading
                comprehension to generate rule-based insights, ML-supported prediction, AI
                guidance, PDF reports, and user-based history tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {loggedIn ? (
                  <>
                    <Link
                      to="/typing-test"
                      className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
                    >
                      Start Assessment
                    </Link>
                    <Link
                      to="/history"
                      className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
                    >
                      View History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
                    >
                      Create Account
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">System Flow</p>
                <h2 className="mt-3 text-2xl font-bold">User → Tests → Analysis → AI Insights</h2>
                <p className="mt-4 text-slate-200 leading-7">
                  The platform combines interactive task-based data collection with behavioral
                  scoring, machine-learning style prediction, AI explanation, PDF reporting,
                  and now secure per-user history storage.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-3xl font-extrabold">3</p>
                  <p className="mt-2 text-sm text-slate-200">Core screening modules</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-3xl font-extrabold">1</p>
                  <p className="mt-2 text-sm text-slate-200">Unified final report</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-3xl font-extrabold">24/7</p>
                  <p className="mt-2 text-sm text-slate-200">Saved access through profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
              Modules
            </p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
              Explore the assessment modules
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Each module captures a different dimension of user behavior and contributes to the
              final screening result and AI-generated recommendation.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`inline-flex rounded-full bg-gradient-to-r ${feature.color} px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white`}>
                  {feature.subtitle}
                </div>

                <h3 className={`mt-5 text-3xl font-extrabold ${feature.textColor}`}>
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-6">
                  {loggedIn ? (
                    <Link
                      to={feature.path}
                      className={`inline-flex rounded-2xl bg-gradient-to-r ${feature.color} px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]`}
                    >
                      {feature.button}
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className={`inline-flex rounded-2xl bg-gradient-to-r ${feature.color} px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]`}
                    >
                      Login to Access
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-14 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">How it works</h2>

          <div className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {index + 1}
                </div>
                <p className="pt-2 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-600">
            Results
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Key outputs</h2>

          <div className="mt-6 space-y-4">
            {outputs.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-slate-700">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
            <h3 className="text-2xl font-bold">Final Result Dashboard</h3>
            <p className="mt-3 text-white/90 leading-7">
              View overall score, dominant concern area, final summary, recommendation, ML
              prediction, chatbot response, and downloadable PDF report in one place.
            </p>
            <div className="mt-5">
              {loggedIn ? (
                <Link
                  to="/final-result"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 shadow"
                >
                  Open Final Result
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 shadow"
                >
                  Login to Continue
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
