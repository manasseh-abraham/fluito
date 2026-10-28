#!/usr/bin/env bash
# Release-candidate AAB pointed at a *dev* API. Production URL is still TBD.
#
#   API_BASE_URL=https://your-dev-host ./tool/build_dev_appbundle.sh
#
# Do not use this script to invent a production host. For Play prod, see PLAY_STORE.md.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${API_BASE_URL:-}" ]]; then
  echo "API_BASE_URL is required (dev host). Example:" >&2
  echo "  API_BASE_URL=http://10.0.2.2:4000 $0" >&2
  exit 1
fi
exec flutter build appbundle --flavor dev --release \
  --dart-define=FLAVOR=dev \
  --dart-define=API_BASE_URL="$API_BASE_URL"
