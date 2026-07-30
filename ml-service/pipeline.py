from collector import collect_mention
from database import save_mentions

def run(brand: str):
    print(f"Collecting mentions for: {brand}")
    mentions = collect_mentions(brand, limit=50)
    print(f"Collected {len(mentions)} articles")

    print("Running sentiment analysis...")
    for mention in mentions:
        result = analyze(mention["text"])
        mention["sentiment_label"] = result["label"]
        mention["sentiment_score"] = result["score"]

    save_mentions(mentions)
    print(f"Done. Saved {len(mentions)} analyzed mentions to Supabase")

if __name__ == "_main_":
    run("Nike")