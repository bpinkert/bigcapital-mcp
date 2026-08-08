#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
nvm use 22 >/dev/null 2>&1 || true
exec node build/index.js
