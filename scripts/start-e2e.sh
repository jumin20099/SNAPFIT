#!/usr/bin/env bash
set -euo pipefail

# DB/Redis 등 의존 서비스 기동
cd snapfit-backend
if command -v docker >/dev/null 2>&1; then
  # 컨테이너 존재 여부 확인 후 없으면 compose로 생성, 있으면 start만 시도
  POSTGRES_EXISTS=$(docker ps -a --format '{{.Names}}' | grep -w 'snapfit-postgres' || true)
  REDIS_EXISTS=$(docker ps -a --format '{{.Names}}' | grep -w 'snapfit-redis' || true)

  if [[ -z "$POSTGRES_EXISTS" || -z "$REDIS_EXISTS" ]]; then
    if command -v docker-compose >/dev/null 2>&1; then
      docker-compose up -d
    else
      docker compose up -d
    fi
  else
    # 존재하면 기동만
    docker start snapfit-postgres >/dev/null 2>&1 || true
    docker start snapfit-redis >/dev/null 2>&1 || true
  fi
else
  echo "[WARN] docker가 없어 docker compose를 건너뜁니다. 로컬 DB가 떠 있어야 합니다." >&2
fi
cd ..

# 프론트/백 동시 기동
npx concurrently "npm:backend" "npm:frontend"

