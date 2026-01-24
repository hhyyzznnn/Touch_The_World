#!/bin/bash

# 데이터베이스 정리 스크립트 실행
# 사용법: ./scripts/cleanup-database.sh

echo "⚠️  경고: 이 스크립트는 데이터베이스의 프로그램 및 관련 데이터를 모두 삭제합니다."
echo "계속하시겠습니까? (yes/no)"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
  echo "취소되었습니다."
  exit 0
fi

echo "데이터베이스 정리 시작..."
npx tsx scripts/cleanup-database.ts
