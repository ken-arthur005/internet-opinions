import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def save_mentions(mentions: list[dict]):
    print(f"Attempting to save {len(mentions)} mentions...")
    if not mentions:
        print("Nothing to save — list is empty")
        return

    response = supabase.table("mentions").insert(mentions).execute()
    return response