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

# 포트 충돌 방지: 3000(Next), 8080(Spring)
if command -v lsof >/dev/null 2>&1; then
  for port in 3000 8080; do
    PID=$(lsof -ti :$port || true)
    if [[ -n "$PID" ]]; then
      echo "[INFO] kill port $port -> $PID"
      kill -9 $PID || true
    fi
  done
fi

# 환경변수 기본값 주입
export API_BASE_URL=${API_BASE_URL:-http://localhost:8080}
export NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-$API_BASE_URL}
export NEXT_PUBLIC_APP_ORIGIN=${NEXT_PUBLIC_APP_ORIGIN:-http://localhost:3000}

# 프론트/백 동시 기동
npx concurrently "npm:backend" "npm:frontend"

