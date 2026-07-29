from transformers import pipeline

sentiment_analysis = pipeline("sentiment-analysis",model="siebert/sentiment-roberta-large-english")

def analyze(text: str) -> dict:
    # Model has a token limit — truncate long texts
    truncated = text[:512]
    result = sentiment_analysis(truncated)[0]

    return {
        "label": result["label"],   # POSITIVE, NEGATIVE, NEUTRAL
        "score": round(result["score"], 4)
    }