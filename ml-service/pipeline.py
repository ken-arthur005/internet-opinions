from collector import NEWS_API_KEY, collect_mention
from database import save_mentions
from sentiment import analyze

print(f"API KEY: {NEWS_API_KEY}")

def run(brand: str):
    print(f"Collecting mentions for: {brand}")
    mentions = collect_mention(brand, limit=50)
    print(f"Collected {len(mentions)} articles")  # what does this print?
    print(f"First article: {mentions[0] if mentions else 'EMPTY'}")
    
    print("Running sentiment analysis...")
    for mention in mentions:
        result = analyze(mention["text"])
        mention["sentiment_label"] = result["label"]
        mention["sentiment_score"] = result["score"]

    save_mentions(mentions)
    print(f"Done. Saved {len(mentions)} analyzed mentions to Supabase")

if __name__ == "__main__":
    try:
        run("Nike")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

