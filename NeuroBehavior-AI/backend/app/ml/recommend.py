from typing import Dict, Any, List


def build_recommendations(
    typing_result: Dict[str, Any],
    attention_result: Dict[str, Any],
    reading_result: Dict[str, Any],
    final_result: Dict[str, Any],
    ml_prediction: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    suggestions: List[str] = []
    focus_areas: List[str] = []

    typing_accuracy = float(typing_result.get("accuracy", 0))
    typing_wpm = float(typing_result.get("wpm", 0))

    attention_score = float(
        attention_result.get("attention_score", attention_result.get("attentionScore", attention_result.get("score", 0)))
    )
    attention_reaction_time = float(
        attention_result.get("reaction_time", attention_result.get("reactionTime", attention_result.get("avg_reaction_time", 0)))
    )

    reading_speed = float(
        reading_result.get("reading_speed", reading_result.get("readingSpeed", reading_result.get("wpm", 0)))
    )
    reading_comprehension = float(
        reading_result.get("comprehension_score", reading_result.get("comprehensionScore", 0))
    )

    dominant = str(
        final_result.get("dominant_concern_area", final_result.get("dominantConcernArea", "balanced"))
    ).lower()

    ml_risk = ""
    if ml_prediction:
        ml_risk = str(
            ml_prediction.get("predicted_risk", ml_prediction.get("predictedRisk", ""))
        ).lower()

    if typing_accuracy < 90 or typing_wpm < 30:
        focus_areas.append("typing")
        suggestions.append("Practice short guided typing drills focusing on accuracy before speed.")
        suggestions.append("Use paced copy-typing exercises for 5 to 10 minutes daily.")

    if attention_score < 75 or attention_reaction_time > 900:
        focus_areas.append("attention")
        suggestions.append("Use short attention-control games with go/no-go style response training.")
        suggestions.append("Practice focus sessions in short intervals with distraction-free conditions.")

    if reading_comprehension < 80 or reading_speed < 140:
        focus_areas.append("reading")
        suggestions.append("Do timed reading passages followed by 3 to 5 comprehension questions.")
        suggestions.append("Break passages into smaller sections and summarize each section aloud.")

    if dominant == "typing":
        suggestions.append("Prioritize typing correction and structured keyboard familiarity exercises.")
    elif dominant == "attention":
        suggestions.append("Prioritize inhibition-control, reaction timing, and sustained attention tasks.")
    elif dominant == "reading":
        suggestions.append("Prioritize comprehension strengthening and paced reading fluency exercises.")

    if ml_risk == "medium":
        suggestions.append("Repeat all modules weekly to monitor consistency and identify fluctuating weak areas.")
    elif ml_risk == "high":
        suggestions.append("Increase practice frequency and monitor performance trends closely across all modules.")

    if not suggestions:
        suggestions.append("Maintain balanced practice across typing, attention, and reading modules.")
        suggestions.append("Repeat the assessment weekly to track progress over time.")

    seen = set()
    deduped = []
    for item in suggestions:
        if item not in seen:
            deduped.append(item)
            seen.add(item)

    summary = (
        "Personalized recommendations were generated using module performance, "
        "final screening output, and ML-based prediction signals."
    )

    return {
        "focus_areas": list(dict.fromkeys(focus_areas)) if focus_areas else ["balanced"],
        "suggestions": deduped[:6],
        "recommendation_summary": summary,
    }
