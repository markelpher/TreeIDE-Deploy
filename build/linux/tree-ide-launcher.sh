#!/usr/bin/env sh
set -eu

APP_NAME="Tree IDE"
APP_ID="tree-ide"
DEFAULT_UPDATE_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/tree-ide"
UPDATE_ROOT="${TREEIDE_UPDATE_ROOT:-$DEFAULT_UPDATE_ROOT}"
VERSIONS_DIR="$UPDATE_ROOT/versions"
PENDING_DIR="$UPDATE_ROOT/pending"
LOG_DIR="$UPDATE_ROOT/logs"
CURRENT_LINK="$UPDATE_ROOT/current"
SELF="$0"
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$SELF")" && pwd)
LOG_FILE="$LOG_DIR/launcher.log"

mkdir -p "$VERSIONS_DIR" "$PENDING_DIR" "$LOG_DIR"

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >> "$LOG_FILE"
}

find_tree_ide_binary() {
  base="$1"
  if [ -x "$base/tree-ide" ]; then
    printf '%s\n' "$base/tree-ide"
    return 0
  fi
  found=$(find "$base" -maxdepth 3 -type f -name tree-ide -perm -111 2>/dev/null | head -n 1 || true)
  if [ -n "$found" ]; then
    printf '%s\n' "$found"
    return 0
  fi
  return 1
}

activate_version() {
  target="$1"
  tmp_link="$UPDATE_ROOT/current.tmp"
  ln -sfn "$target" "$tmp_link"
  mv -Tf "$tmp_link" "$CURRENT_LINK"
}

install_update() {
  archive="$1"
  version="$2"
  if [ ! -f "$archive" ]; then
    log "missing archive: $archive"
    exit 2
  fi

  target="$VERSIONS_DIR/$version"
  staging="$PENDING_DIR/$version"
  rm -rf "$staging"
  mkdir -p "$staging"

  log "extracting $archive to $staging"
  tar -xzf "$archive" -C "$staging"

  app_root="$staging"
  binary=$(find_tree_ide_binary "$staging") || {
    log "tree-ide binary not found in update archive"
    exit 3
  }
  app_root=$(CDPATH= cd -- "$(dirname -- "$binary")" && pwd)

  rm -rf "$target.previous"
  if [ -d "$target" ]; then
    mv "$target" "$target.previous"
  fi
  mv "$app_root" "$target"
  rm -rf "$staging"
  activate_version "$target"
  log "activated $version at $target"

  TREEIDE_LAUNCHER=1 \
  TREEIDE_LAUNCHER_BIN="$SELF" \
  TREEIDE_UPDATE_ROOT="$UPDATE_ROOT" \
  TREEIDE_ACTIVE_VERSION_DIR="$target" \
  "$target/tree-ide" >/dev/null 2>&1 &
}

launch_current() {
  if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
    binary=$(find_tree_ide_binary "$CURRENT_LINK" || true)
    if [ -n "${binary:-}" ]; then
      TREEIDE_LAUNCHER=1 \
      TREEIDE_LAUNCHER_BIN="$SELF" \
      TREEIDE_UPDATE_ROOT="$UPDATE_ROOT" \
      TREEIDE_ACTIVE_VERSION_DIR=$(CDPATH= cd -- "$(dirname -- "$binary")" && pwd) \
      "$binary" "$@"
      return $?
    fi
  fi

  binary=$(find_tree_ide_binary "$SELF_DIR" || true)
  if [ -z "${binary:-}" ]; then
    log "bundled tree-ide binary not found near $SELF_DIR"
    printf '%s\n' "$APP_NAME executable was not found." >&2
    exit 4
  fi

  TREEIDE_LAUNCHER=1 \
  TREEIDE_LAUNCHER_BIN="$SELF" \
  TREEIDE_UPDATE_ROOT="$UPDATE_ROOT" \
  TREEIDE_ACTIVE_VERSION_DIR=$(CDPATH= cd -- "$(dirname -- "$binary")" && pwd) \
  "$binary" "$@"
}

case "${1:-}" in
  --install-update)
    if [ "$#" -lt 3 ]; then
      printf '%s\n' "Usage: $SELF --install-update <archive.tar.gz> <version>" >&2
      exit 64
    fi
    install_update "$2" "$3"
    ;;
  *)
    launch_current "$@"
    ;;
esac