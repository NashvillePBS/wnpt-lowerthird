#!/bin/bash
# Rebuilds the two PowerPoint sign templates. Needs node and a pptxgenjs install on NODE_PATH; the
# design-system backup's Office build has one (templates/office/build/node_modules), or `npm install
# pptxgenjs` anywhere and point NODE_PATH at it. apply_theme.js is the pptx skill's theme writer, copied here.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export NODE_PATH="${NODE_PATH:-/Users/sburkeen/Projects/wnpt-design/design-system/templates/office/build/node_modules}"
node "$HERE/build-signs-pptx.js" "$(cd "$HERE/.." && pwd)"
