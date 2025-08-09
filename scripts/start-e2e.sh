#!/usr/bin/env bash
set -euo pipefail

# DB/Redis 등 의존 서비스 기동
cd snapfit-backend
if command -v docker >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose up -d
  else
    docker compose up -d
  fi
else
  echo "[WARN] docker가 없어 docker compose를 건너뜁니다. 로컬 DB가 떠 있어야 합니다." >&2
fi
cd ..

# 프론트/백 동시 기동
npx concurrently "npm:backend" "npm:frontend"

