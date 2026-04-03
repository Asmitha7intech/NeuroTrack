import csv
from pathlib import Path
from typing import Dict, Any

from app.ml.feature_extractor import extract_behavior_features

DATA_PATH = Path("data/real_behavior_data.csv")
DATA_PATH.parent.mkdir(parents=True, exist_ok=True)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def ensure_file():
    if not DATA_PATH.exists():
        fieldnames = [
            "typing_wpm",
            "typing_accuracy",
            "typing_errors",
            "typing_backspaces",
            "typing_error_rate",
            "typing_correction_rate",
            "attention_hits",
            "attention_false_clicks",
            "attention_misses",
            "attention_reaction_time",
            "attention_accuracy",
            "attention_score",
            "attention_impulsivity_rate",
            "attention_miss_rate",
            "reading_speed",
            "reading_comprehension",
            "reading_correct_answers",
            "reading_efficiency",
            "risk_label",
            "dominant_issue",
        ]
        with open(DATA_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()


def clean_features(features: Dict[str, Any]) -> Dict[str, float]:
    cleaned = dict(features)

    cleaned["typing_wpm"] = round(clamp(float(cleaned.get("typing_wpm", 0)), 0, 120), 2)
    cleaned["typing_accuracy"] = round(clamp(float(cleaned.get("typing_accuracy", 0)), 0, 100), 2)
    cleaned["typing_errors"] = round(clamp(float(cleaned.get("typing_errors", 0)), 0, 50), 2)
    cleaned["typing_backspaces"] = round(clamp(float(cleaned.get("typing_backspaces", 0)), 0, 100), 2)
    cleaned["typing_error_rate"] = round(clamp(float(cleaned.get("typing_error_rate", 0)), 0, 5), 4)
    cleaned["typing_correction_rate"] = round(clamp(float(cleaned.get("typing_correction_rate", 0)), 0, 5), 4)

    cleaned["attention_hits"] = round(clamp(float(cleaned.get("attention_hits", 0)), 0, 100), 2)
    cleaned["attention_false_clicks"] = round(clamp(float(cleaned.get("attention_false_clicks", 0)), 0, 100), 2)
    cleaned["attention_misses"] = round(clamp(float(cleaned.get("attention_misses", 0)), 0, 100), 2)
    cleaned["attention_reaction_time"] = round(clamp(float(cleaned.get("attention_reaction_time", 0)), 0, 3000), 2)
    cleaned["attention_accuracy"] = round(clamp(float(cleaned.get("attention_accuracy", 0)), 0, 100), 2)
    cleaned["attention_score"] = round(clamp(float(cleaned.get("attention_score", 0)), 0, 100), 2)
    cleaned["attention_impulsivity_rate"] = round(clamp(float(cleaned.get("attention_impulsivity_rate", 0)), 0, 5), 4)
    cleaned["attention_miss_rate"] = round(clamp(float(cleaned.get("attention_miss_rate", 0)), 0, 5), 4)

    cleaned["reading_speed"] = round(clamp(float(cleaned.get("reading_speed", 0)), 0, 400), 2)
    cleaned["reading_comprehension"] = round(clamp(float(cleaned.get("reading_comprehension", 0)), 0, 100), 2)
    cleaned["reading_correct_answers"] = round(clamp(float(cleaned.get("reading_correct_answers", 0)), 0, 20), 2)
    cleaned["reading_efficiency"] = round(clamp(float(cleaned.get("reading_efficiency", 0)), 0, 400), 2)

    return cleaned


def save_session_row(
    typing_result: Dict[str, Any],
    attention_result: Dict[str, Any],
    reading_result: Dict[str, Any],
    risk_label: str,
    dominant_issue: str,
):
    ensure_file()

    features = extract_behavior_features(
        typing_result=typing_result,
        attention_result=attention_result,
        reading_result=reading_result,
    )

    cleaned_features = clean_features(features)

    row = {
        **cleaned_features,
        "risk_label": str(risk_label).lower(),
        "dominant_issue": str(dominant_issue).lower(),
    }

    fieldnames = [
        "typing_wpm",
        "typing_accuracy",
        "typing_errors",
        "typing_backspaces",
        "typing_error_rate",
        "typing_correction_rate",
        "attention_hits",
        "attention_false_clicks",
        "attention_misses",
        "attention_reaction_time",
        "attention_accuracy",
        "attention_score",
        "attention_impulsivity_rate",
        "attention_miss_rate",
        "reading_speed",
        "reading_comprehension",
        "reading_correct_answers",
        "reading_efficiency",
        "risk_label",
        "dominant_issue",
    ]

    with open(DATA_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writerow(row)

    return row
