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


import re

# Mirrors support.js's own CAMEL_ATTR_RE (build-time-baked into the bundle):
# any camelCase attribute name (onClick, onChange, viewBox, ...) is rewritten
# to "sc-camel-" + kebab-case so the browser's HTML parser never lowercases it
# away. Discovered 2026-08-01: a hunk whose context spans an untouched
# onClick=/viewBox=/etc. attribute failed to match because the bundle has
# already applied this rewrite; the source (and git HEAD) has not.
#
# This rewrite applies ONLY to the template markup, never to the component
# script: applying it there mangled `closeTips = () => {...}` (a JS class
# field — matches the same "lowercase-then-uppercase, then optional space,
# then =" shape) into `sc-camel-close-tips = () => {...}`, a syntax error.
# The two live in one file but are split by the `<script data-dc-script>`
# tag; TEMPLATE_END_MARKER locates that boundary in the OLD file so hunks
# on either side of it are escaped differently.
CAMEL_ATTR_RE = re.compile(r"(\s)([a-z]+[A-Z][A-Za-z0-9]*)(\s*=)")
TEMPLATE_END_MARKER = '<script type="text/x-dc" data-dc-script>'


def _to_camel_attr(m):
    sp, name, eq = m.group(1), m.group(2), m.group(3)
    kebab = re.sub(r"[A-Z]", lambda c: "-" + c.group(0).lower(), name)
    return sp + "sc-camel-" + kebab + eq


def esc(t: str, is_template: bool) -> str:
    """Escape plain source text into the bundle's embedded-string encoding.

    Verified against the bundle (2026-07-31): double quotes become \\", real
    newlines become the two characters backslash-n, the two characters "<" "/"
    become "<" + \\u002F (script-tag safety), and non-ASCII stays raw UTF-8.
    Verified 2026-08-01: camelCase attribute names (onClick, onChange, onInput,
    onFocus, onBlur, onDrop, onDragOver, onDragLeave, viewBox, ...) are
    rewritten sc-camel-kebab-case in the TEMPLATE ONLY, same rule as
    support.js's CAMEL_ATTR_RE — the component script is never run through it
    (see TEMPLATE_END_MARKER above).
    Also verified 2026-08-01 (the `api()` regex literal, `/\\/+$/`): a literal
    backslash becomes two backslashes, the ordinary JS-string-literal rule —
    must run before quote/newline/`</` escaping so it doesn't double-escape
    the backslashes those steps introduce.
    """
    if is_template:
        t = CAMEL_ATTR_RE.sub(_to_camel_attr, t)
    t = t.replace("\\", "\\\\")
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

template_end_idx = next(
    i for i, line in enumerate(old_lines) if TEMPLATE_END_MARKER in line)

def block(lines, a, b, ctx):
    return "".join(lines[max(0, a - ctx):min(len(lines), b + ctx)])


dist = open(DIST, encoding="utf-8").read()
print(f"{len(merged)} merged hunks")
for k, (i1, i2, j1, j2) in enumerate(merged):
    is_template = i1 < template_end_idx
    applied = False
    for ctx in range(1, MAX_CTX + 1):
        o = block(old_lines, i1, i2, ctx)
        n = block(new_lines, j1, j2, ctx)
        eo = esc(o, is_template)
        c = dist.count(eo)
        if c == 1:
            dist = dist.replace(eo, esc(n, is_template))
            print(f"hunk {k}: applied with ctx={ctx} ({len(o)} -> {len(n)} chars)")
            applied = True
            break
        if c > 1:
            # N identical edits at N identical sites (e.g. relabeling three
            # byte-identical header buttons): safe iff this hunk and the
            # remaining hunks include exactly c copies of the SAME old->new
            # block. Then each hunk consumes the first remaining match, in
            # order — difflib emitted them in order, so this is exact.
            twins = sum(1 for (a1, a2, b1, b2) in merged[k:]
                        if block(old_lines, a1, a2, ctx) == o
                        and block(new_lines, b1, b2, ctx) == n)
            if twins == c:
                dist = dist.replace(eo, esc(n, is_template), 1)
                print(f"hunk {k}: applied first-of-{c} identical sites at ctx={ctx}")
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
