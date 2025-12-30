#!/bin/bash
# 개발 환경에서 Prisma Studio 실행 (Transaction Pooler 사용)

# DATABASE_POOLING_URL을 DATABASE_URL로 임시 사용
export DATABASE_URL="$DATABASE_POOLING_URL"

echo "🚀 Prisma Studio 시작 중..."
echo "📊 브라우저에서 http://localhost:5555 접속"
echo ""
echo "⚠️  참고: Transaction Pooler를 사용하므로 일부 기능이 제한될 수 있습니다."
echo ""

npx prisma studio

