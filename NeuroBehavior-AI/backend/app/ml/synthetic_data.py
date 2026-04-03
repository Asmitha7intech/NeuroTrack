import random
import csv
from pathlib import Path


OUTPUT_FILE = Path("data/behavioral_dataset.csv")
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)


def generate_sample(label: str):
    if label == "low":
        typing_wpm = random.uniform(35, 70)
        typing_accuracy = random.uniform(88, 99)
        typing_errors = random.randint(0, 4)
        typing_backspaces = random.randint(0, 6)

        attention_hits = random.randint(18, 25)
        attention_false_clicks = random.randint(0, 2)
        attention_misses = random.randint(0, 3)
        attention_reaction_time = random.uniform(250, 500)
        attention_accuracy = random.uniform(85, 100)
        attention_score = random.uniform(75, 100)

        reading_speed = random.uniform(140, 220)
        reading_comprehension = random.uniform(80, 100)
        reading_correct_answers = random.randint(4, 5)

    elif label == "medium":
        typing_wpm = random.uniform(20, 40)
        typing_accuracy = random.uniform(70, 88)
        typing_errors = random.randint(3, 8)
        typing_backspaces = random.randint(3, 10)

        attention_hits = random.randint(12, 20)
        attention_false_clicks = random.randint(1, 5)
        attention_misses = random.randint(2, 7)
        attention_reaction_time = random.uniform(400, 750)
        attention_accuracy = random.uniform(60, 85)
        attention_score = random.uniform(45, 75)

        reading_speed = random.uniform(100, 150)
        reading_comprehension = random.uniform(55, 80)
        reading_correct_answers = random.randint(2, 4)

    else:  # high
        typing_wpm = random.uniform(8, 25)
        typing_accuracy = random.uniform(40, 72)
        typing_errors = random.randint(7, 15)
        typing_backspaces = random.randint(6, 18)

        attention_hits = random.randint(5, 14)
        attention_false_clicks = random.randint(4, 10)
        attention_misses = random.randint(6, 12)
        attention_reaction_time = random.uniform(650, 1200)
        attention_accuracy = random.uniform(30, 65)
        attention_score = random.uniform(15, 50)

        reading_speed = random.uniform(60, 110)
        reading_comprehension = random.uniform(20, 60)
        reading_correct_answers = random.randint(0, 3)

    typed_word_count = max(10, int(typing_wpm))
    typing_error_rate = typing_errors / typed_word_count
    typing_correction_rate = typing_backspaces / typed_word_count

    attention_impulsivity_rate = attention_false_clicks / (attention_hits + attention_false_clicks + 1)
    attention_miss_rate = attention_misses / (attention_hits + attention_misses + 1)

    reading_efficiency = reading_speed * (reading_comprehension / 100.0)

    if attention_score < 50:
        dominant_issue = "attention_issue"
    elif reading_comprehension < 60:
        dominant_issue = "reading_issue"
    elif typing_accuracy < 75:
        dominant_issue = "typing_issue"
    else:
        dominant_issue = "balanced"

    return {
        "typing_wpm": round(typing_wpm, 2),
        "typing_accuracy": round(typing_accuracy, 2),
        "typing_errors": typing_errors,
        "typing_backspaces": typing_backspaces,
        "typing_error_rate": round(typing_error_rate, 4),
        "typing_correction_rate": round(typing_correction_rate, 4),

        "attention_hits": attention_hits,
        "attention_false_clicks": attention_false_clicks,
        "attention_misses": attention_misses,
        "attention_reaction_time": round(attention_reaction_time, 2),
        "attention_accuracy": round(attention_accuracy, 2),
        "attention_score": round(attention_score, 2),
        "attention_impulsivity_rate": round(attention_impulsivity_rate, 4),
        "attention_miss_rate": round(attention_miss_rate, 4),

        "reading_speed": round(reading_speed, 2),
        "reading_comprehension": round(reading_comprehension, 2),
        "reading_correct_answers": reading_correct_answers,
        "reading_efficiency": round(reading_efficiency, 2),

        "risk_label": label,
        "dominant_issue": dominant_issue,
    }


def main():
    rows = []

    for _ in range(250):
        rows.append(generate_sample("low"))
    for _ in range(250):
        rows.append(generate_sample("medium"))
    for _ in range(250):
        rows.append(generate_sample("high"))

    random.shuffle(rows)

    fieldnames = list(rows[0].keys())

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Dataset saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
