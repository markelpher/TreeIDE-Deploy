#!/usr/bin/env bash
# Dispatches release-finalize.yml only when every platform CI workflow has
# succeeded for the tag commit. Earlier platform jobs exit quietly; the last
# platform to finish triggers a single Release Finalize run.

set -euo pipefail

sha="${1:?commit SHA required}"
tag="${2:?release tag required}"

if ! echo "$tag" | grep -qE '^v'; then
  echo "::error::Invalid release tag: $tag"
  exit 1
fi

required_workflows=(
  "Build Windows"
  "Build Linux"
  "Build macOS"
)

pending=0
for workflow in "${required_workflows[@]}"; do
  status=$(gh run list \
    --workflow "$workflow" \
    --commit "$sha" \
    --json status,conclusion \
    -q '.[0].status' || true)
  conclusion=$(gh run list \
    --workflow "$workflow" \
    --commit "$sha" \
    --json status,conclusion \
    -q '.[0].conclusion' || true)

  if [ -z "$status" ] || [ "$status" = "null" ]; then
    pending=1
    echo "$workflow: run not found yet"
    continue
  fi

  if [ "$status" != "completed" ]; then
    pending=1
    echo "$workflow: $status"
    continue
  fi

  if [ "$conclusion" != "success" ]; then
    echo "::error::$workflow finished with $conclusion — release will not be published."
    exit 1
  fi

  echo "$workflow: success"
done

if [ "$pending" -ne 0 ]; then
  echo "Other platform builds still running — not dispatching Release Finalize yet."
  exit 0
fi

active_finalize=$(gh run list \
  --workflow "Release Finalize" \
  --commit "$sha" \
  --json status \
  -q '.[] | select(.status == "queued" or .status == "in_progress" or .status == "pending" or .status == "waiting") | .status' \
  | head -1 || true)

if [ -n "$active_finalize" ]; then
  echo "Release Finalize is already queued or running for $tag — skipping duplicate dispatch."
  exit 0
fi

echo "All platform builds finished — dispatching Release Finalize for $tag."
gh workflow run release-finalize.yml \
  --ref "$tag" \
  -f "sha=$sha" \
  -f "tag=$tag"