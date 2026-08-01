#!/usr/bin/env python3
"""Mirror committed .dc.html edits into dist/index.html.

There is no local bundler (build.md 13.1). dist/index.html embeds the entire
.dc.html source as an escaped JS string; this script derives the edit hunks by
diffing `git show HEAD:<source>` against the worktree source, escapes each hunk
into the bundle's encoding, and applies it with an exactly-once assert. Any
ambiguity aborts before a byte is written. Read scripts/patch-dist.md first.

Run from anywhere; paths resolve relative to this file. After it succeeds:
    cp dist/index.html index.html
"""
import difflib
import os
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = "Nashville PBS - Lower Thirds Studio.dc.html"
DIST = os.path.join(REPO, "dist", "index.html")

old_src = subprocess.run(
    ["git", "-C", REPO, "show", f"HEAD:{SRC}"],
    capture_output=True, text=True, check=True).stdout
new_src = open(os.path.join(REPO, SRC), encoding="utf-8").read()

if old_src == new_src:
    print("source is identical to HEAD — nothing to patch")
    sys.exit(0)

old_lines = old_src.splitlines(keepends=True)
new_lines = new_src.splitlines(keepends=True)


def esc(t: str) -> str:
    """Escape plain source text into the bundle's embedded-string encoding.

    Verified against the bundle (2026-07-31): double quotes become \\", real
    newlines become the two characters backslash-n, the two characters "<" "/"
    become "<" + \\u002F (script-tag safety), and non-ASCII stays raw UTF-8.
    Backslashes in a hunk mean these rules are unverified for it — abort.
    """
    assert "\\" not in t, "hunk contains a backslash; escaping rules unverified"
    t = t.replace('"', '\\"')
    t = t.replace("\n", "\\n")
    t = t.replace("</", "<\\u002F")
    return t


# Keep hunks small: the bundle rewrites asset src URLs to data URIs, so a hunk
# spanning an <img src="assets/..."> line can never match the bundle text.
MERGE_GAP = 3
MAX_CTX = 12

ops = [op for op in difflib.SequenceMatcher(
    None, old_lines, new_lines, autojunk=False).get_opcodes() if op[0] != "equal"]

merged = []
for tag, i1, i2, j1, j2 in ops:
    if merged and i1 - merged[-1][1] < MERGE_GAP:
        merged[-1] = (merged[-1][0], i2, merged[-1][2], j2)
    else:
        merged.append((i1, i2, j1, j2))

dist = open(DIST, encoding="utf-8").read()
print(f"{len(merged)} merged hunks")
for k, (i1, i2, j1, j2) in enumerate(merged):
    applied = False
    for ctx in range(1, MAX_CTX + 1):
        o = "".join(old_lines[max(0, i1 - ctx):min(len(old_lines), i2 + ctx)])
        n = "".join(new_lines[max(0, j1 - ctx):min(len(new_lines), j2 + ctx)])
        eo = esc(o)
        c = dist.count(eo)
        if c == 1:
            dist = dist.replace(eo, esc(n))
            print(f"hunk {k}: applied with ctx={ctx} ({len(o)} -> {len(n)} chars)")
            applied = True
            break
        if c == 0:
            print(f"ABORT: hunk {k} has 0 matches at ctx={ctx} — the bundle text "
                  f"differs from HEAD source here (stale dist? asset line? "
                  f"encoding drift?). Nothing was written.")
            print("--- looked for (escaped, head) ---")
            print(eo[:400])
            sys.exit(1)
        print(f"hunk {k}: ctx={ctx} matched {c}x, widening")
    if not applied:
        print(f"ABORT: hunk {k} never unique up to ctx={MAX_CTX}. Nothing was written.")
        print(o[:300])
        sys.exit(1)

open(DIST, "w", encoding="utf-8").write(dist)
print("dist/index.html written — now: cp dist/index.html index.html, then verify it boots")
