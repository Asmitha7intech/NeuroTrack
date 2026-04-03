import { isLoggedIn } from "../utils/auth";
import { fetchMyHistory } from "../utils/historyApi";
import { useEffect, useState } from "react";
import { clearSessionHistory, getSessionHistory } from "../utils/history";
import type { SessionHistoryItem } from "../utils/history";

type BackendHistoryItem = {
  id: number;
  created_at?: string;
  session_label?: string;
  overall_score?: number;
  overall_risk?: string;
  dominant_concern_area?: string;
  final_result?: Record<string, any> | null;
};

const History = () => {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [backendSessions, setBackendSessions] = useState<BackendHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setErrorText("");

      try {
        if (isLoggedIn()) {
          const data = await fetchMyHistory();
          setBackendSessions(data.items || []);
          setSessions([]);
        } else {
          setSessions(getSessionHistory());
          setBackendSessions([]);
        }
      } catch (error: any) {
        console.error("History load error:", error);
        setErrorText(error?.message || "Failed to load history");
        setSessions(getSessionHistory());
        setBackendSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleClearHistory = () => {
    const confirmed = window.confirm("Are you sure you want to clear all session history?");
    if (!confirmed) return;

    if (isLoggedIn()) {
      alert("Backend history clear is not added yet. Local cached history only will be cleared.");
    }

    clearSessionHistory();
    setSessions([]);
  };

  const hasBackendData = isLoggedIn() && backendSessions.length > 0;
  const hasLocalData = !isLoggedIn() && sessions.length > 0;
  const showEmpty = !loading && !hasBackendData && !hasLocalData;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Session History</h1>
            <p className="mt-2 text-sm text-gray-600">
              View completed NeuroBehavior AI sessions.
            </p>
          </div>

          <button
            onClick={handleClearHistory}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
          >
            Clear History
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Loading history...
          </div>
        ) : errorText ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {errorText}
          </div>
        ) : null}

        {showEmpty ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            No sessions found.
          </div>
        ) : hasBackendData ? (
          <div className="grid grid-cols-1 gap-4">
            {backendSessions.map((session) => {
              const finalResult = session.final_result || {};
              const overallScore =
                session.overall_score ??
                finalResult.overallScore ??
                finalResult.overall_score ??
                0;

              const risk =
                session.overall_risk ??
                finalResult.overallRisk ??
                finalResult.overall_risk ??
                "N/A";

              const dominantConcernArea =
                session.dominant_concern_area ??
                finalResult.dominantConcernArea ??
                finalResult.dominant_concern_area ??
                "N/A";

              const formattedDate = session.created_at
                ? new Date(session.created_at).toLocaleString()
                : session.session_label || "Saved Session";

              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <h3 className="text-lg font-bold text-gray-800">{formattedDate}</h3>
                  {session.session_label ? (
                    <p className="mt-1 text-sm text-gray-500">{session.session_label}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-gray-600">Overall Score: {overallScore}</p>
                  <p className="text-sm text-gray-600">Risk: {risk}</p>
                  <p className="text-sm text-gray-600">
                    Dominant Concern Area: {dominantConcernArea}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <h3 className="text-lg font-bold text-gray-800">{session.formattedDate}</h3>
                <p className="mt-2 text-sm text-gray-600">Overall Score: {session.overallScore}</p>
                <p className="text-sm text-gray-600">Risk: {session.risk}</p>
                <p className="text-sm text-gray-600">
                  Dominant Concern Area: {session.dominantConcernArea}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
