export type AnyRecord = Record<string, any>;

export interface SessionHistoryItem {
  id: string;
  timestamp: string;
  formattedDate: string;
  overallScore: number;
  risk: string;
  dominantConcernArea: string;
  typingScore: number;
  attentionScore: number;
  readingScore: number;
  typingResult: AnyRecord | null;
  attentionResult: AnyRecord | null;
  readingResult: AnyRecord | null;
  finalResult: AnyRecord | null;
  predictionResult: AnyRecord | null;
}

const HISTORY_STORAGE_KEY = "neuroBehaviorSessionHistory";
const LAST_SIGNATURE_KEY = "neuroBehaviorLastSavedSignature";

function safeParse<T>(value: string | null): T | null {
  try {
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function getLocal(key: string): AnyRecord | null {
  return safeParse<AnyRecord>(localStorage.getItem(key));
}

function pickFirst(obj: AnyRecord | null | undefined, keys: string[], fallback: any = null) {
  if (!obj) return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
}

function toNumber(value: any, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace("%", "").trim();
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeRisk(value: any): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "Unknown";

  const lower = text.toLowerCase();
  if (lower.includes("low")) return "Low";
  if (lower.includes("medium")) return "Medium";
  if (lower.includes("high")) return "High";

  return text;
}

function buildSignature(finalResult: AnyRecord | null, predictionResult: AnyRecord | null) {
  return JSON.stringify({
    overallScore: pickFirst(finalResult, ["overallScore", "overall_score"], 0),
    overallRisk: pickFirst(finalResult, ["overallRisk", "overall_risk"], "Unknown"),
    predictedRisk: pickFirst(predictionResult, ["predictedRisk", "predicted_risk"], "Unknown"),
    dominantConcernArea: pickFirst(finalResult, ["dominantConcernArea", "dominant_concern_area"], "Unknown"),
  });
}

export function getSessionHistory(): SessionHistoryItem[] {
  return safeParse<SessionHistoryItem[]>(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
}

export function clearSessionHistory(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  localStorage.removeItem(LAST_SIGNATURE_KEY);
}

export function saveCurrentSessionFromLocalStorage(): boolean {
  const typing = getLocal("typingResult");
  const attention = getLocal("attentionResult");
  const reading = getLocal("readingResult");
  const final = getLocal("finalResult");
  const prediction = getLocal("predictionResult");

  if (!final) return false;

  const signature = buildSignature(final, prediction);
  const lastSignature = localStorage.getItem(LAST_SIGNATURE_KEY);

  if (lastSignature === signature) {
    return false;
  }

  const risk = normalizeRisk(
    pickFirst(
      prediction,
      ["predictedRisk", "predicted_risk", "risk"],
      pickFirst(final, ["overallRisk", "overall_risk", "risk"], "Unknown")
    )
  );

  const now = new Date();

  const session: SessionHistoryItem = {
    id: now.getTime().toString(),
    timestamp: now.toISOString(),
    formattedDate: now.toLocaleString(),
    overallScore: toNumber(pickFirst(final, ["overallScore", "overall_score"], 0), 0),
    risk,
    dominantConcernArea: pickFirst(final, ["dominantConcernArea", "dominant_concern_area"], "Unknown"),
    typingScore: toNumber(pickFirst(typing, ["wpm", "score", "typingScore", "typing_score"], 0), 0),
    attentionScore: toNumber(pickFirst(attention, ["attentionScore", "attention_score", "score"], 0), 0),
    readingScore: toNumber(pickFirst(reading, ["comprehensionScore", "comprehension_score", "score"], 0), 0),
    typingResult: typing,
    attentionResult: attention,
    readingResult: reading,
    finalResult: final,
    predictionResult: prediction,
  };

  const existing = getSessionHistory();
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([session, ...existing]));
  localStorage.setItem(LAST_SIGNATURE_KEY, signature);

  return true;
}
