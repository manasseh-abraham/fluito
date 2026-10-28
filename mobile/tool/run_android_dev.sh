#!/usr/bin/env bash
# Run the Android *dev* flavor against a development API.
#
# Default: hosted Fluito dev API.
# Override for emulator → local Bun: API_BASE_URL=http://10.0.2.2:4000
set -euo pipefail
cd "$(dirname "$0")/.."
API_BASE_URL="${API_BASE_URL:-https://api.fluito.veritas.org.in}"
exec flutter run --flavor dev \
  --dart-define=FLAVOR=dev \
  --dart-define=API_BASE_URL="$API_BASE_URL" \
  "$@"
