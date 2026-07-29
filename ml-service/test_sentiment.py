# test_sentiment.py
from sentiment import analyze

tests = [
    "I absolutely love this product, it changed my life",
    "This is the worst experience I have ever had",
    "The product arrived on time and works as expected"
]

for text in tests:
    result = analyze(text)
    print(f"{result['label']} ({result['score']}) — {text[:60]}")