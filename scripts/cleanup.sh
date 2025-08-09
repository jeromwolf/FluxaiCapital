#!/bin/bash

# FLUX AI Capital 프로젝트 구조 정리 스크립트
# 실행 전 반드시 백업하세요!

echo "🧹 FLUX AI Capital 프로젝트 구조 정리 시작..."

# 1. 테스트 디렉토리 생성
echo "📁 테스트 디렉토리 생성 중..."
mkdir -p tests/api tests/auth tests/integration

# 2. 테스트 파일 이동
echo "📦 테스트 파일 이동 중..."
if ls test-api*.js 1> /dev/null 2>&1; then
    mv test-api*.js tests/api/ 2>/dev/null || echo "⚠️  API 테스트 파일 이동 실패"
fi

if ls test-auth.* 1> /dev/null 2>&1; then
    mv test-auth.* tests/auth/ 2>/dev/null || echo "⚠️  Auth 테스트 파일 이동 실패"
fi

if ls test-*.js test-*.sh 1> /dev/null 2>&1; then
    mv test-*.js tests/integration/ 2>/dev/null || echo "⚠️  통합 테스트 파일 이동 실패"
    mv test-*.sh tests/integration/ 2>/dev/null || echo "⚠️  Shell 테스트 파일 이동 실패"
fi

if [ -f test-report.md ]; then
    mv test-report.md tests/ 2>/dev/null || echo "⚠️  테스트 리포트 이동 실패"
fi

# 3. 중복 파일 제거
echo "🗑️  중복 파일 제거 중..."
[ -f next.config.ts ] && rm -f next.config.ts && echo "✅ next.config.ts 제거됨"
[ -f postcss.config.js ] && rm -f postcss.config.js && echo "✅ postcss.config.js 제거됨"
[ -f dev.sh ] && rm -f dev.sh && echo "✅ 루트의 dev.sh 제거됨"

# 4. 문서 파일 이동
echo "📚 문서 파일 이동 중..."
if [ -f ENV_SETUP_GUIDE.md ]; then
    mv ENV_SETUP_GUIDE.md docs/ && echo "✅ ENV_SETUP_GUIDE.md를 docs로 이동"
fi

# 5. 로그 및 빌드 파일 정리
echo "🧽 로그 및 빌드 파일 정리 중..."
[ -f dev.log ] && rm -f dev.log && echo "✅ dev.log 제거됨"
[ -f tsconfig.tsbuildinfo ] && rm -f tsconfig.tsbuildinfo && echo "✅ tsconfig.tsbuildinfo 제거됨"

# 6. Prisma 중첩 폴더 정리
echo "🗂️  Prisma 중첩 폴더 정리 중..."
if [ -d prisma/prisma ]; then
    rm -rf prisma/prisma && echo "✅ 중첩된 prisma 폴더 제거됨"
fi

# 7. .gitignore 업데이트
echo "📝 .gitignore 업데이트 중..."
if ! grep -q "dev.log" .gitignore; then
    echo "dev.log" >> .gitignore
fi
if ! grep -q "tsconfig.tsbuildinfo" .gitignore; then
    echo "tsconfig.tsbuildinfo" >> .gitignore
fi
if ! grep -q "*.log" .gitignore; then
    echo "*.log" >> .gitignore
fi

# 8. CLEANUP_PLAN.md 제거 (정리 완료 후)
echo "🎯 정리 계획 파일 제거 중..."
[ -f CLEANUP_PLAN.md ] && rm -f CLEANUP_PLAN.md

echo "✨ 프로젝트 구조 정리 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. git status로 변경사항 확인"
echo "2. git add -A && git commit -m 'chore: Clean up project structure'"
echo "3. 필요시 일부 파일 복원: git checkout -- <filename>"