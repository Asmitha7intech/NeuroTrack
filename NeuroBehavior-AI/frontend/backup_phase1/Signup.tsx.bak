import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../utils/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorText("");
    setLoading(true);

    try {
      await signup(fullName, email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorText(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#4f46e5,_#020617_55%)] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl backdrop-blur lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-fuchsia-600 via-violet-600 to-blue-600 p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            New User
          </p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">
            Create your profile and start your cognitive screening
          </h1>
          <p className="mt-5 text-base text-white/90 leading-7">
            Build your personal account to save reports, track session history, and access your results anytime.
          </p>

          <div className="mt-8 space-y-3 text-sm text-white/90">
            <div className="rounded-2xl bg-white/10 p-4">Secure user-based history storage.</div>
            <div className="rounded-2xl bg-white/10 p-4">Protected access to tests and results.</div>
            <div className="rounded-2xl bg-white/10 p-4">Better long-term tracking and evaluation flow.</div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-400">NeuroBehavior AI</p>
              <h2 className="mt-3 text-4xl font-bold">Signup</h2>
              <p className="mt-2 text-slate-400">
                Create your NeuroBehavior AI profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {errorText ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorText}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Signup"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-fuchsia-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
