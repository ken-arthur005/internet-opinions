# test_collect.py
from collector import collect_mention

mentions = collect_mention("Messi", limit=10)
for m in mentions:
    print(f"[{m['source']}] {m['text'][:120]}")
    print("---")