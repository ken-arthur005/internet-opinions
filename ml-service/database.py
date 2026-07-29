import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def save_mentions(mentions: list[dict]):
    if not mentions:
        return

    response = supabase.table("mentions").insert(mentions).execute()
    return response