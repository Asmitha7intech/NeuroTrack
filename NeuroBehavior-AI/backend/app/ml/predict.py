from typing import Any, Dict, List


def _get(obj: Dict[str, Any] | None, keys: List[str], default: Any = 0) -> Any:
    if not obj:
        return default
    for key in keys:
        if key in obj and obj[key] is not None:
            return obj[key]
    return default


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if isinstance(value, str):
            value = value.replace("%", "").strip()
        return float(value)
    except Exception:
        return default


def predict_behavior(payload: Dict[str, Any]) -> Dict[str, Any]:
    typing = payload.get("typingResult") or payload.get("typing_result") or {}
    attention = payload.get("attentionResult") or payload.get("attention_result") or {}
    reading = payload.get("readingResult") or payload.get("reading_result") or {}

    wpm = _to_float(_get(typing, ["wpm", "speed"], 0))
    accuracy = _to_float(_get(typing, ["accuracy"], 0))
    typing_errors = _to_float(_get(typing, ["errors", "errorCount", "error_count"], 0))

    attention_score = _to_float(_get(attention, ["attentionScore", "attention_score", "score"], 0))
    reaction_time = _to_float(_get(attention, ["reactionTime", "reaction_time"], 0))

    reading_speed = _to_float(_get(reading, ["readingSpeed", "reading_speed", "wpm"], 0))
    comprehension = _to_float(_get(reading, ["comprehensionScore", "comprehension_score"], 0))
    correct_answers = _to_float(_get(reading, ["correctAnswers", "correct_answers"], 0))

    risk_points = 0
    explanation: List[str] = []

    if accuracy < 85:
        risk_points += 2
        explanation.append("Typing accuracy is below the expected threshold.")
    elif accuracy < 95:
        risk_points += 1
        explanation.append("Typing accuracy is slightly reduced.")

    if wpm < 15:
        risk_points += 2
        explanation.append("Typing speed is very low.")
    elif wpm < 25:
        risk_points += 1
        explanation.append("Typing speed is below average.")

    if typing_errors > 10:
        risk_points += 2
        explanation.append("Typing error count is high.")
    elif typing_errors > 3:
        risk_points += 1
        explanation.append("Typing error count is mildly elevated.")

    if attention_score < 40:
        risk_points += 2
        explanation.append("Attention score is low.")
    elif attention_score < 70:
        risk_points += 1
        explanation.append("Attention score is moderate.")

    if reaction_time > 1800:
        risk_points += 2
        explanation.append("Reaction time is very slow.")
    elif reaction_time > 1200:
        risk_points += 1
        explanation.append("Reaction time is slightly slow.")

    if comprehension < 40:
        risk_points += 2
        explanation.append("Reading comprehension is low.")
    elif comprehension < 70:
        risk_points += 1
        explanation.append("Reading comprehension is moderate.")

    if reading_speed < 80:
        risk_points += 2
        explanation.append("Reading speed is very low.")
    elif reading_speed < 120:
        risk_points += 1
        explanation.append("Reading speed is below average.")

    if correct_answers <= 1:
        risk_points += 1
        explanation.append("Few reading questions were answered correctly.")

    if risk_points <= 2:
        predicted_risk = "Low"
        probabilities = {"Low": 78, "Medium": 18, "High": 4}
        confidence = 78
    elif risk_points <= 5:
        predicted_risk = "Medium"
        probabilities = {"Low": 18, "Medium": 68, "High": 14}
        confidence = 68
    else:
        predicted_risk = "High"
        probabilities = {"Low": 6, "Medium": 24, "High": 70}
        confidence = 70

    if not explanation:
        explanation.append("All module indicators are within expected ranges.")

    summary_text = (
        f"The behavioral screening result suggests {predicted_risk.lower()} risk "
        f"with {confidence}% confidence based on typing, attention, and reading patterns."
    )

    return {
        "predictedRisk": predicted_risk,
        "predicted_risk": predicted_risk,
        "confidence": confidence,
        "probabilities": probabilities,
        "summaryText": summary_text,
        "summary_text": summary_text,
        "explanation": explanation,
    }
