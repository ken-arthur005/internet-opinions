from collector import collect_mention
from database import save_mentions

def run(brand: str):
    print(f"Collecting mentions for brand: {brand}")
    mentions = collect_mention(brand, limit=10)
    print(f"Found {len(mentions)} mentions for brand: {brand}")

    save_mentions(mentions)

if __name__ == "__main__":
    run("Nike")