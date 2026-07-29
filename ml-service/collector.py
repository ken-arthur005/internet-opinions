import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
BASE_URL = "https://newsapi.org/v2/everything"

def collect_mention(brand: str, limit: int = 10) -> list[dict]:

    from_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    params = {
        "q": brand,
        "from": from_date,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": limit,
        "apiKey": NEWS_API_KEY
    }

    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()

    articles = response.json().get("articles", [])

    mentions = []
    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".strip()

        if not text:
            continue

        mentions.append({
            "brand": brand,
            "text": text,
            "source": article.get("source", {}).get("name", "news"),
            "url": article.get("url", ""),
            "created_at": article.get("publishedAt", ""),
        })
        
    return mentions
