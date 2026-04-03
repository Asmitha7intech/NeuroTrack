from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List


app = FastAPI(title="NeuroBehavior AI Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TypingRequest(BaseModel):
    original_text: str
    typed_text: str
    time_taken: float
    backspace_count: int = 0


def safe_div(a: float, b: float) -> float:
    return a / b if b != 0 else 0.0


def normalize_text(text: str) -> str:
    return " ".join(text.strip().lower().split())


def get_value(data: Dict[str, Any], *keys, default=0):
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default


def risk_to_concern(risk: str) -> int:
    mapping = {"low": 1, "medium": 2, "high": 3}
    return mapping.get(str(risk).lower(), 2)


@app.get("/")
def root():
    return {"message": "NeuroBehavior AI backend is running"}


@app.post("/analyze-typing")
def analyze_typing(request: TypingRequest):
    original_words = normalize_text(request.original_text).split()
    typed_words = normalize_text(request.typed_text).split()

    correct_words = 0
    for i in range(min(len(original_words), len(typed_words))):
        if original_words[i] == typed_words[i]:
            correct_words += 1

    total_reference_words = len(original_words)
    typed_word_count = len(typed_words)

    minutes = request.time_taken / 60 if request.time_taken > 0 else 1 / 60
    wpm = typed_word_count / minutes
    accuracy = safe_div(correct_words, total_reference_words) * 100
    errors = max(total_reference_words, typed_word_count) - correct_words

    if accuracy >= 90 and wpm >= 30:
        risk_level = "Low"
        summary_text = "Typing performance looks stable with good speed and accuracy."
    elif accuracy >= 75:
        risk_level = "Medium"
        summary_text = "Typing performance shows moderate difficulty with some errors or slower speed."
    else:
        risk_level = "High"
        summary_text = "Typing performance indicates notable difficulty in speed and/or accuracy."

    return {
        "wpm": round(wpm, 2),
        "accuracy": round(accuracy, 2),
        "errors": int(errors),
        "risk_level": risk_level,
        "riskLevel": risk_level,
        "summary_text": summary_text,
        "summaryText": summary_text,
        "backspace_count": int(request.backspace_count),
        "backspaceCount": int(request.backspace_count),
        "typed_word_count": int(typed_word_count),
        "typedWordCount": int(typed_word_count),
    }


@app.post("/analyze-attention")
def analyze_attention(payload: Dict[str, Any]):
    hits = int(get_value(payload, "hits", default=0))
    false_clicks = int(get_value(payload, "false_clicks", "falseClicks", default=0))
    misses = int(get_value(payload, "misses", default=0))
    reaction_time = float(get_value(payload, "reaction_time", "reactionTime", "avg_reaction_time", "avgReactionTime", default=0))
    accuracy = float(get_value(payload, "accuracy", default=0))
    score = float(get_value(payload, "score", "attention_score", "attentionScore", default=0))
    correct_ignores = int(get_value(payload, "correct_ignores", "correctIgnores", default=0))
    best_combo = int(get_value(payload, "best_combo", "bestCombo", default=0))

    if accuracy == 0:
        total_targets = hits + misses
        if total_targets > 0:
            accuracy = (hits / total_targets) * 100

    if score == 0:
        speed_component = 0
        if reaction_time > 0:
            if reaction_time <= 350:
                speed_component = 30
            elif reaction_time <= 550:
                speed_component = 22
            elif reaction_time <= 800:
                speed_component = 14
            else:
                speed_component = 8

        accuracy_component = min(accuracy, 100) * 0.5
        control_penalty = false_clicks * 4 + misses * 3
        combo_bonus = min(best_combo, 10) * 1.5

        score = max(0, min(100, speed_component + accuracy_component + combo_bonus - control_penalty))

    score = max(0, min(100, score))

    if accuracy >= 85 and false_clicks <= 2 and misses <= 3:
        focus_level = "High"
    elif accuracy >= 65:
        focus_level = "Moderate"
    else:
        focus_level = "Low"

    if false_clicks <= 2:
        impulsivity_level = "Low"
    elif false_clicks <= 5:
        impulsivity_level = "Moderate"
    else:
        impulsivity_level = "High"

    if score >= 75:
        risk_level = "Low"
        summary_text = "Attention control appears stable with good focus and response consistency."
    elif score >= 45:
        risk_level = "Medium"
        summary_text = "Attention performance is moderate with some impulsive responses or misses."
    else:
        risk_level = "High"
        summary_text = "Attention performance suggests significant difficulty with focus or inhibition control."

    return {
        "attention_score": round(score, 2),
        "attentionScore": round(score, 2),
        "focus_level": focus_level,
        "focusLevel": focus_level,
        "impulsivity_level": impulsivity_level,
        "impulsivityLevel": impulsivity_level,
        "risk_level": risk_level,
        "riskLevel": risk_level,
        "summary_text": summary_text,
        "summaryText": summary_text,
        "behavior_summary": summary_text,
        "behaviorSummary": summary_text,
        "hits": hits,
        "false_clicks": false_clicks,
        "falseClicks": false_clicks,
        "misses": misses,
        "reaction_time": reaction_time,
        "reactionTime": reaction_time,
        "accuracy": round(accuracy, 2),
        "score": round(score, 2),
        "correct_ignores": correct_ignores,
        "correctIgnores": correct_ignores,
        "best_combo": best_combo,
        "bestCombo": best_combo,
        "local_level": "Intermediate",
        "localLevel": "Intermediate",
    }


@app.post("/analyze-reading")
def analyze_reading(payload: Dict[str, Any]):
    reading_speed = float(get_value(payload, "reading_speed", "readingSpeed", "wpm", default=0))
    comprehension_score = float(get_value(payload, "comprehension_score", "comprehensionScore", default=0))
    correct_answers = int(get_value(payload, "correct_answers", "correctAnswers", default=0))
    total_questions = int(get_value(payload, "total_questions", "totalQuestions", default=3))
    time_taken = float(get_value(payload, "time_taken", "timeTaken", default=0))
    passage_text = str(get_value(payload, "passage_text", "passageText", default=""))

    if reading_speed == 0 and time_taken > 0 and passage_text.strip():
        word_count = len(passage_text.strip().split())
        reading_speed = word_count / (time_taken / 60)

    if comprehension_score == 0 and total_questions > 0:
        comprehension_score = (correct_answers / total_questions) * 100

    reading_speed = round(reading_speed, 2)
    comprehension_score = round(comprehension_score, 2)

    if comprehension_score >= 80 and reading_speed >= 140:
        reading_risk = "Low"
        summary_text = "Reading performance appears strong with good speed and comprehension."
    elif comprehension_score >= 55:
        reading_risk = "Medium"
        summary_text = "Reading performance is moderate with some comprehension or speed difficulty."
    else:
        reading_risk = "High"
        summary_text = "Reading performance suggests higher difficulty in comprehension and/or pace."

    return {
        "reading_speed": reading_speed,
        "readingSpeed": reading_speed,
        "wpm": reading_speed,
        "comprehension_score": comprehension_score,
        "comprehensionScore": comprehension_score,
        "correct_answers": correct_answers,
        "correctAnswers": correct_answers,
        "reading_risk": reading_risk,
        "readingRisk": reading_risk,
        "risk_level": reading_risk,
        "riskLevel": reading_risk,
        "summary_text": summary_text,
        "summaryText": summary_text,
    }


@app.post("/analyze-final")
def analyze_final(payload: Dict[str, Any]):
    typing_result = get_value(payload, "typing_result", "typingResult", "typing", default={}) or {}
    attention_result = get_value(payload, "attention_result", "attentionResult", "attention", default={}) or {}
    reading_result = get_value(payload, "reading_result", "readingResult", "reading", default={}) or {}

    available_modules: List[str] = []
    concern_map = {}
    module_scores = []

    if typing_result:
        available_modules.append("typing")
        typing_accuracy = float(get_value(typing_result, "accuracy", default=0))
        typing_wpm = float(get_value(typing_result, "wpm", default=0))
        typing_score = min(100.0, typing_accuracy * 0.7 + min(typing_wpm, 60) * 0.5)
        typing_score = round(typing_score, 2)
        module_scores.append(("typing", typing_score))
        typing_risk = str(get_value(typing_result, "risk_level", "riskLevel", default="Medium"))
        concern_map["typing"] = risk_to_concern(typing_risk)

    if attention_result:
        available_modules.append("attention")
        attention_score = float(get_value(attention_result, "attention_score", "attentionScore", "score", default=0))
        attention_score = max(0, min(100, attention_score))
        attention_score = round(attention_score, 2)
        module_scores.append(("attention", attention_score))
        attention_risk = str(get_value(attention_result, "risk_level", "riskLevel", default="Medium"))
        concern_map["attention"] = risk_to_concern(attention_risk)

    if reading_result:
        available_modules.append("reading")
        reading_speed = float(get_value(reading_result, "reading_speed", "readingSpeed", "wpm", default=0))
        reading_comp = float(get_value(reading_result, "comprehension_score", "comprehensionScore", default=0))
        reading_score = min(100.0, reading_comp * 0.75 + min(reading_speed, 200) * 0.15)
        reading_score = round(reading_score, 2)
        module_scores.append(("reading", reading_score))
        reading_risk = str(get_value(reading_result, "reading_risk", "readingRisk", "risk_level", "riskLevel", default="Medium"))
        concern_map["reading"] = risk_to_concern(reading_risk)

    overall_score = round(sum(score for _, score in module_scores) / len(module_scores), 2) if module_scores else 0.0

    if overall_score >= 75:
        overall_risk = "Low"
    elif overall_score >= 50:
        overall_risk = "Medium"
    else:
        overall_risk = "High"

    dominant_concern_area = max(concern_map, key=concern_map.get) if concern_map else "balanced"

    if dominant_concern_area == "typing":
        recommendation = "Focus on guided typing practice, error correction tasks, and paced copy exercises."
    elif dominant_concern_area == "attention":
        recommendation = "Use short attention-training games, inhibition-control tasks, and reaction-timing exercises."
    elif dominant_concern_area == "reading":
        recommendation = "Practice timed reading, comprehension drills, and structured passage review."
    else:
        recommendation = "Continue balanced cognitive practice across all modules."

    final_summary = (
        f"Combined screening indicates {overall_risk.lower()} overall behavioral difficulty risk. "
        f"Primary concern area: {dominant_concern_area}."
    )

    module_score_map = {name: round(score, 2) for name, score in module_scores}

    return {
        "overall_score": overall_score,
        "overallScore": overall_score,
        "overall_risk": overall_risk,
        "overallRisk": overall_risk,
        "dominant_concern_area": dominant_concern_area,
        "dominantConcernArea": dominant_concern_area,
        "final_summary": final_summary,
        "finalSummary": final_summary,
        "recommendation": recommendation,
        "available_modules": available_modules,
        "availableModules": available_modules,
        "typing_score": module_score_map.get("typing", 0),
        "typingScore": module_score_map.get("typing", 0),
        "attention_score": module_score_map.get("attention", 0),
        "attentionScore": module_score_map.get("attention", 0),
        "reading_score": module_score_map.get("reading", 0),
        "readingScore": module_score_map.get("reading", 0),
    }


@app.post("/predict-behavior")
def predict_behavior_endpoint(payload: Dict[str, Any]):
    try:
        from app.ml.feature_extractor import extract_behavior_features
        from app.ml.predict import predict_behavior
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML import error: {str(e)}")

    typing_result = get_value(payload, "typing_result", "typingResult", "typing", default={}) or {}
    attention_result = get_value(payload, "attention_result", "attentionResult", "attention", default={}) or {}
    reading_result = get_value(payload, "reading_result", "readingResult", "reading", default={}) or {}

    try:
        features = extract_behavior_features(
            typing_result,
            attention_result,
            reading_result,
        )

        prediction = predict_behavior(features)

        risk = prediction["predicted_risk"]
        confidence = prediction["confidence"]

        if risk == "low":
            summary_text = f"ML analysis indicates a low behavioral difficulty risk with {confidence:.1f}% confidence."
        elif risk == "medium":
            summary_text = f"ML analysis indicates a moderate behavioral difficulty risk with {confidence:.1f}% confidence."
        else:
            summary_text = f"ML analysis indicates a high behavioral difficulty risk with {confidence:.1f}% confidence."

        return {
            "features_used": features,
            "featuresUsed": features,
            "predicted_risk": prediction["predicted_risk"],
            "predictedRisk": prediction["predicted_risk"],
            "confidence": prediction["confidence"],
            "probabilities": prediction["probabilities"],
            "summary_text": summary_text,
            "summaryText": summary_text,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML prediction error: {str(e)}")
