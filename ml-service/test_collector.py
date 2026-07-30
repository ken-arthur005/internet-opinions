# test_collect.py
from collector import collect_mention

mentions = collect_mention("Ronaldo",10)
for m in mentions:
    print(f"[{m['source']}] {m['text'][:120]}")
    print("---")