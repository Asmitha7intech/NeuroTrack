from fastapi import APIRouter
from app.ml.schema import FinalBehaviorRequest
from app.ml.feature_extractor import extract_behavior_features
from app.ml.predict import predict_behavior

router = APIRouter()


def generate_ml_summary(prediction: dict) -> str:
    risk = prediction["predicted_risk"]
    confidence = prediction["confidence"]

    if risk == "low":
        return f"ML analysis indicates a low behavioral difficulty risk with {confidence:.1f}% confidence."
    elif risk == "medium":
        return f"ML analysis indicates a moderate behavioral difficulty risk with {confidence:.1f}% confidence."
    return f"ML analysis indicates a high behavioral difficulty risk with {confidence:.1f}% confidence."


@router.post("/predict-behavior")
def predict_behavior_endpoint(payload: FinalBehaviorRequest):
    features = extract_behavior_features(
        payload.typing_result,
        payload.attention_result,
        payload.reading_result,
    )

    prediction = predict_behavior(features)

    return {
        "features_used": features,
        "predicted_risk": prediction["predicted_risk"],
        "confidence": prediction["confidence"],
        "probabilities": prediction["probabilities"],
        "summary_text": generate_ml_summary(prediction),
    }
