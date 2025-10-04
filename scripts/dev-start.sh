#!/bin/bash

echo "🚀 SnapFit 개발 환경 시작 중..."

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "gradle.*bootRun" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# 1. 데이터베이스 및 Redis 시작
echo "📦 Docker 서비스 시작..."
cd snapfit-backend
docker-compose up -d

# 2. 백엔드 빌드 및 시작
echo "🔨 백엔드 빌드 중..."
./gradlew build -x test

echo "☕ 백엔드 시작 중..."
./gradlew bootRun &
BACKEND_PID=$!

# 3. 백엔드 시작 대기
echo "⏳ 백엔드 시작 대기 중..."
until curl -s http://localhost:8080/api/health > /dev/null; do
    echo "백엔드 시작 대기 중..."
    sleep 2
done

echo "✅ 백엔드 시작 완료!"

# 4. OpenAPI 스키마 생성
echo "📋 OpenAPI 스키마 생성 중..."
cd ..
npm run generate:api:local

# 5. 프론트엔드 시작
echo "🌐 프론트엔드 시작 중..."
npm run dev &
FRONTEND_PID=$!

# 6. 프로세스 관리
echo "🎯 개발 환경 시작 완료!"
echo "백엔드: http://localhost:8080"
echo "프론트엔드: http://localhost:3000"
echo "OpenAPI: http://localhost:8080/swagger-ui.html"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"

# 시그널 핸들링
cleanup() {
    echo "🛑 개발 환경 종료 중..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    pkill -f "gradle.*bootRun" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    cd snapfit-backend
    docker-compose down
    exit
}

trap cleanup INT TERM

# 프로세스 대기
wait
