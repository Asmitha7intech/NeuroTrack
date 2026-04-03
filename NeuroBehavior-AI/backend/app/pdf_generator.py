from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


def get_value(data, *keys, default="-"):
    for key in keys:
        if isinstance(data, dict) and key in data and data[key] is not None:
            return data[key]
    return default


def generate_pdf_report(data, file_path="NeuroBehavior_Report.pdf"):
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()
    content = []

    typing_result = data.get("typing_result") or data.get("typingResult") or {}
    attention_result = data.get("attention_result") or data.get("attentionResult") or {}
    reading_result = data.get("reading_result") or data.get("readingResult") or {}
    final_result = data.get("final_result") or data.get("finalResult") or {}
    ml_result = data.get("ml_result") or data.get("mlResult") or {}

    content.append(Paragraph("NeuroBehavior AI Report", styles["Title"]))
    content.append(Spacer(1, 12))

    content.append(Paragraph("Final Summary", styles["Heading2"]))
    content.append(Paragraph(f"Overall Score: {get_value(final_result, 'overall_score', 'overallScore')}", styles["Normal"]))
    content.append(Paragraph(f"Overall Risk: {get_value(final_result, 'overall_risk', 'overallRisk')}", styles["Normal"]))
    content.append(Paragraph(f"Dominant Concern Area: {get_value(final_result, 'dominant_concern_area', 'dominantConcernArea')}", styles["Normal"]))
    content.append(Paragraph(f"Summary: {get_value(final_result, 'final_summary', 'finalSummary')}", styles["Normal"]))
    content.append(Paragraph(f"Recommendation: {get_value(final_result, 'recommendation')}", styles["Normal"]))
    content.append(Spacer(1, 12))

    content.append(Paragraph("Typing Module", styles["Heading2"]))
    content.append(Paragraph(f"WPM: {get_value(typing_result, 'wpm')}", styles["Normal"]))
    content.append(Paragraph(f"Accuracy: {get_value(typing_result, 'accuracy')}%", styles["Normal"]))
    content.append(Paragraph(f"Errors: {get_value(typing_result, 'errors')}", styles["Normal"]))
    content.append(Paragraph(f"Risk: {get_value(typing_result, 'risk_level', 'riskLevel')}", styles["Normal"]))
    content.append(Paragraph(f"Summary: {get_value(typing_result, 'summary_text', 'summaryText')}", styles["Normal"]))
    content.append(Spacer(1, 12))

    content.append(Paragraph("Attention Module", styles["Heading2"]))
    content.append(Paragraph(f"Attention Score: {get_value(attention_result, 'attention_score', 'attentionScore', 'score')}", styles["Normal"]))
    content.append(Paragraph(f"Reaction Time: {get_value(attention_result, 'reaction_time', 'reactionTime', 'avg_reaction_time', 'avgReactionTime')} ms", styles["Normal"]))
    content.append(Paragraph(f"Risk: {get_value(attention_result, 'risk_level', 'riskLevel')}", styles["Normal"]))
    content.append(Paragraph(f"Summary: {get_value(attention_result, 'summary_text', 'summaryText', 'behavior_summary', 'behaviorSummary')}", styles["Normal"]))
    content.append(Spacer(1, 12))

    content.append(Paragraph("Reading Module", styles["Heading2"]))
    content.append(Paragraph(f"Reading Speed: {get_value(reading_result, 'reading_speed', 'readingSpeed', 'wpm')} WPM", styles["Normal"]))
    content.append(Paragraph(f"Comprehension: {get_value(reading_result, 'comprehension_score', 'comprehensionScore')}%", styles["Normal"]))
    content.append(Paragraph(f"Correct Answers: {get_value(reading_result, 'correct_answers', 'correctAnswers')}", styles["Normal"]))
    content.append(Paragraph(f"Risk: {get_value(reading_result, 'reading_risk', 'readingRisk', 'risk_level', 'riskLevel')}", styles["Normal"]))
    content.append(Paragraph(f"Summary: {get_value(reading_result, 'summary_text', 'summaryText')}", styles["Normal"]))
    content.append(Spacer(1, 12))

    content.append(Paragraph("ML Prediction", styles["Heading2"]))
    content.append(Paragraph(f"Predicted Risk: {get_value(ml_result, 'predicted_risk', 'predictedRisk')}", styles["Normal"]))
    content.append(Paragraph(f"Confidence: {get_value(ml_result, 'confidence')}%", styles["Normal"]))
    content.append(Paragraph(f"ML Summary: {get_value(ml_result, 'summary_text', 'summaryText')}", styles["Normal"]))

    doc.build(content)
    return file_path
