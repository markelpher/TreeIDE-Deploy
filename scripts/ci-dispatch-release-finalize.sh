#!/usr/bin/env bash
# Signals the caller workflow to run Release Finalize inline once every platform
# CI workflow has succeeded for the tag commit. Earlier platform jobs exit quietly;
# the last platform to finish sets run_finalize=true (with dedup for races).

set -euo pipefail

sha="${1:?commit SHA required}"
tag="${2:?release tag required}"
current_workflow="${3:-}"

github_output="${GITHUB_OUTPUT:-}"

write_output() {
  local key="$1"
  local value="$2"
  if [ -n "$github_output" ]; then
    {
      echo "$key<<EOF"
      echo "$value"
      echo "EOF"
    } >> "$github_output"
  fi
}

if ! echo "$tag" | grep -qE '^v'; then
  echo "::error::Invalid release tag: $tag"
  write_output run_finalize false
  exit 1
fi

required_workflows=(
  "Build Windows"
)

pending=0
for workflow in "${required_workflows[@]}"; do
  if [ -n "$current_workflow" ] && [ "$workflow" = "$current_workflow" ]; then
    echo "$workflow: success (current workflow — build jobs finished)"
    continue
  fi

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
    write_output run_finalize false
    exit 1
  fi

  echo "$workflow: success"
done

if [ "$pending" -ne 0 ]; then
  echo "Other platform builds still running — not running Release Finalize yet."
  write_output run_finalize false
  exit 0
fi

finalize_job="Release finalize"
for workflow in "${required_workflows[@]}"; do
  # The current run already lists Release finalize as queued/waiting before dispatch
  # finishes — ignore our own workflow when checking for an active duplicate.
  if [ -n "$current_workflow" ] && [ "$workflow" = "$current_workflow" ]; then
    continue
  fi

  run_id=$(gh run list \
    --workflow "$workflow" \
    --commit "$sha" \
    --json databaseId \
    -q '.[0].databaseId' || true)

  if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
    continue
  fi

  while IFS=$'\t' read -r job_status job_conclusion; do
    if [ "$job_status" = "in_progress" ]; then
      echo "Release Finalize already in progress in $workflow — skipping duplicate run."
      write_output run_finalize false
      exit 0
    fi

    if [ "$job_status" = "completed" ] && [ "$job_conclusion" = "success" ]; then
      echo "Release Finalize already succeeded in $workflow — skipping duplicate run."
      write_output run_finalize false
      exit 0
    fi
  done < <(gh run view "$run_id" \
    --json jobs \
    -q ".jobs[] | select(.name == \"$finalize_job\") | [.status, .conclusion] | @tsv" || true)
done

echo "All platform builds finished — running Release Finalize inline for $tag."
write_output run_finalize true

