#!/usr/bin/env bash
# Run the Android *dev* flavor against a development API.
#
# Defaults: Android emulator → Bun on the host (http://10.0.2.2:4000).
# Override with API_BASE_URL for a physical device or a hosted dev server:
#   API_BASE_URL=http://192.168.1.20:4000 ./tool/run_android_dev.sh
#   API_BASE_URL=https://dev.example.com ./tool/run_android_dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."
API_BASE_URL="${API_BASE_URL:-http://10.0.2.2:4000}"
exec flutter run --flavor dev \
  --dart-define=FLAVOR=dev \
  --dart-define=API_BASE_URL="$API_BASE_URL" \
  "$@"
