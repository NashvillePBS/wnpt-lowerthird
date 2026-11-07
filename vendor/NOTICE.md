# Vendored libraries (shared by endcards/ and signs/)

Both files are byte-for-byte the published npm builds, fetched from jsdelivr on 2026-11-06 and kept here so the
tool has no network dependency at export time (build.md §11.1 records why that matters for a broadcast tool).

| File | Package | Version | License | Source | sha256 |
|---|---|---|---|---|---|
| `html-to-image.js` | html-to-image (the studio pins the same version) | 1.11.11 | MIT | https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js | `0181b9a4ea3351540751b2e72b6baecb5c2297093fcb0bd2af94fc531cb0fbda` |
| `qrcode.js` | qrcode-generator, Kazuhiko Arase | 1.4.4 | MIT | https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js | `18ae399f81182bc9de916e9c77b195df20cc58d6f2d55a62b085a299f1bf1780` |

Do not edit them. To upgrade, fetch the new build, record the version and hash here, and rerun
`python3 scripts/verify-graphics.py --samples`.
