from typing import Dict, Any, List

FEATURE_LABELS = {
    "typing_wpm": "Typing speed",
    "typing_accuracy": "Typing accuracy",
    "typing_errors": "Typing errors",
    "typing_backspaces": "Typing corrections",
    "typing_error_rate": "Typing error rate",
    "typing_correction_rate": "Typing correction rate",
    "attention_hits": "Attention hits",
    "attention_false_clicks": "False clicks",
    "attention_misses": "Missed targets",
    "attention_reaction_time": "Reaction time",
    "attention_accuracy": "Attention accuracy",
    "attention_score": "Attention score",
    "attention_impulsivity_rate": "Impulsivity rate",
    "attention_miss_rate": "Miss rate",
    "reading_speed": "Reading speed",
    "reading_comprehension": "Reading comprehension",
    "reading_correct_answers": "Reading correct answers",
    "reading_efficiency": "Reading efficiency",
}


def explain_prediction(feature_dict: Dict[str, Any]) -> Dict[str, Any]:
    reasons: List[Dict[str, str]] = []

    typing_accuracy = float(feature_dict.get("typing_accuracy", 0))
    typing_wpm = float(feature_dict.get("typing_wpm", 0))
    attention_score = float(feature_dict.get("attention_score", 0))
    attention_reaction_time = float(feature_dict.get("attention_reaction_time", 0))
    reading_comprehension = float(feature_dict.get("reading_comprehension", 0))
    reading_speed = float(feature_dict.get("reading_speed", 0))

    if typing_accuracy < 80:
        reasons.append({
            "feature": "Typing accuracy",
            "effect": "Lower accuracy may increase behavioral difficulty risk."
        })
    elif typing_accuracy >= 95:
        reasons.append({
            "feature": "Typing accuracy",
            "effect": "High typing accuracy supports a lower behavioral difficulty risk."
        })

    if typing_wpm < 20:
        reasons.append({
            "feature": "Typing speed",
            "effect": "Lower typing speed may contribute to higher risk."
        })
    elif typing_wpm >= 35:
        reasons.append({
            "feature": "Typing speed",
            "effect": "Stable typing speed supports lower risk."
        })

    if attention_score < 50:
        reasons.append({
            "feature": "Attention score",
            "effect": "Lower attention score may indicate focus or inhibition difficulty."
        })
    elif attention_score >= 75:
        reasons.append({
            "feature": "Attention score",
            "effect": "Strong attention score supports lower risk."
        })

    if attention_reaction_time > 900:
        reasons.append({
            "feature": "Reaction time",
            "effect": "Slower reaction time may increase concern in attention performance."
        })
    elif 0 < attention_reaction_time <= 500:
        reasons.append({
            "feature": "Reaction time",
            "effect": "Faster reaction time supports better attention performance."
        })

    if reading_comprehension < 60:
        reasons.append({
            "feature": "Reading comprehension",
            "effect": "Lower comprehension may increase reading-related concern."
        })
    elif reading_comprehension >= 80:
        reasons.append({
            "feature": "Reading comprehension",
            "effect": "Strong comprehension supports lower risk."
        })

    if reading_speed < 100:
        reasons.append({
            "feature": "Reading speed",
            "effect": "Slower reading speed may contribute to difficulty."
        })
    elif reading_speed >= 140:
        reasons.append({
            "feature": "Reading speed",
            "effect": "Healthy reading speed supports lower risk."
        })

    if not reasons:
        reasons.append({
            "feature": "Overall pattern",
            "effect": "The model used the combined behavioral pattern across all modules."
        })

    return {
        "top_factors": reasons[:4]
    }
