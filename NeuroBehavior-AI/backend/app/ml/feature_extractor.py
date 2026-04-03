from typing import Dict, Any


def safe_div(a: float, b: float) -> float:
    return a / b if b != 0 else 0.0


def extract_behavior_features(
    typing_result: Dict[str, Any],
    attention_result: Dict[str, Any],
    reading_result: Dict[str, Any],
) -> Dict[str, float]:
    # Typing
    typing_wpm = float(typing_result.get("wpm", 0))
    typing_accuracy = float(typing_result.get("accuracy", 0))
    typing_errors = float(typing_result.get("errors", 0))
    typing_backspaces = float(typing_result.get("backspace_count", 0))

    typed_word_count = float(typing_result.get("typed_word_count", 1))
    typing_error_rate = safe_div(typing_errors, typed_word_count)
    typing_correction_rate = safe_div(typing_backspaces, typed_word_count)

    # Attention
    attention_hits = float(attention_result.get("hits", 0))
    attention_false_clicks = float(attention_result.get("false_clicks", 0))
    attention_misses = float(attention_result.get("misses", 0))
    attention_reaction_time = float(attention_result.get("reaction_time", 0))
    attention_accuracy = float(attention_result.get("accuracy", 0))
    attention_score = float(attention_result.get("score", 0))

    attention_impulsivity_rate = safe_div(
        attention_false_clicks, attention_hits + attention_false_clicks + 1
    )
    attention_miss_rate = safe_div(
        attention_misses, attention_hits + attention_misses + 1
    )

    # Reading
    reading_speed = float(reading_result.get("reading_speed", 0))
    reading_comprehension = float(reading_result.get("comprehension_score", 0))
    reading_correct_answers = float(reading_result.get("correct_answers", 0))
    reading_efficiency = reading_speed * (reading_comprehension / 100.0)

    return {
        "typing_wpm": typing_wpm,
        "typing_accuracy": typing_accuracy,
        "typing_errors": typing_errors,
        "typing_backspaces": typing_backspaces,
        "typing_error_rate": typing_error_rate,
        "typing_correction_rate": typing_correction_rate,

        "attention_hits": attention_hits,
        "attention_false_clicks": attention_false_clicks,
        "attention_misses": attention_misses,
        "attention_reaction_time": attention_reaction_time,
        "attention_accuracy": attention_accuracy,
        "attention_score": attention_score,
        "attention_impulsivity_rate": attention_impulsivity_rate,
        "attention_miss_rate": attention_miss_rate,

        "reading_speed": reading_speed,
        "reading_comprehension": reading_comprehension,
        "reading_correct_answers": reading_correct_answers,
        "reading_efficiency": reading_efficiency,
    }
