from pathlib import Path
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder


SYNTHETIC_DATA_PATH = Path("data/behavioral_dataset.csv")
REAL_DATA_PATH = Path("data/real_behavior_data.csv")
MODEL_PATH = Path("app/ml/behavior_model.pkl")
ENCODER_PATH = Path("app/ml/label_encoder.pkl")


FEATURE_COLUMNS = [
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
]


def load_data():
    frames = []

    if SYNTHETIC_DATA_PATH.exists():
        df_syn = pd.read_csv(SYNTHETIC_DATA_PATH)
        frames.append(df_syn)

    if REAL_DATA_PATH.exists():
        df_real = pd.read_csv(REAL_DATA_PATH)
        frames.append(df_real)

    if not frames:
        raise FileNotFoundError("No dataset found for retraining.")

    df = pd.concat(frames, ignore_index=True)
    df = df.dropna(subset=FEATURE_COLUMNS + ["risk_label"])

    return df


def main():
    df = load_data()

    X = df[FEATURE_COLUMNS]
    y = df["risk_label"].astype(str).str.lower()

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("Retrained Model Accuracy:", round(acc * 100, 2), "%")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)

    print(f"Retrained model saved to {MODEL_PATH}")
    print(f"Label encoder saved to {ENCODER_PATH}")
    print(f"Total samples used: {len(df)}")


if __name__ == "__main__":
    main()
