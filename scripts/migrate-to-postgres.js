#!/usr/bin/env node

/**
 * SQLite에서 PostgreSQL로 데이터베이스 마이그레이션 스크립트
 * 
 * 사용법:
 * 1. PostgreSQL 데이터베이스 준비
 * 2. .env 파일에서 DATABASE_URL을 PostgreSQL URL로 변경
 * 3. node scripts/migrate-to-postgres.js 실행
 */

const fs = require('fs');
const path = require('path');

console.log('📋 PostgreSQL 마이그레이션 가이드');
console.log('================================');
console.log('');

console.log('1️⃣  PostgreSQL 설치 및 데이터베이스 생성');
console.log('   - PostgreSQL 설치: https://postgresql.org/download/');
console.log('   - 데이터베이스 생성: createdb fluxai');
console.log('');

console.log('2️⃣  환경 변수 업데이트');
console.log('   .env.local 파일에서:');
console.log('   DATABASE_URL="file:./dev.db"');
console.log('   ↓');
console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/fluxai"');
console.log('   DIRECT_URL="postgresql://username:password@localhost:5432/fluxai"');
console.log('');

console.log('3️⃣  Prisma 스키마 업데이트');
console.log('   prisma/schema.prisma 파일에서:');
console.log('   provider = "sqlite"');
console.log('   ↓');
console.log('   provider = "postgresql"');
console.log('   directUrl = env("DIRECT_URL") 추가');
console.log('');

console.log('4️⃣  마이그레이션 실행');
console.log('   npm run db:generate');
console.log('   npm run db:push');
console.log('');

console.log('5️⃣  데이터 이전 (선택사항)');
console.log('   기존 SQLite 데이터가 있다면 별도 데이터 이전 도구 사용');
console.log('');

console.log('✅ 완료 후 애플리케이션 재시작');

// 자동 업데이트할 파일들 체크
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const envPath = path.join(__dirname, '../.env.local');

console.log('');
console.log('📁 확인할 파일들:');
console.log(`   - ${schemaPath}`);
console.log(`   - ${envPath}`);

if (process.argv.includes('--auto')) {
  console.log('');
  console.log('🔄 자동 업데이트 모드 (실험적)...');
  
  try {
    // Schema 업데이트
    let schema = fs.readFileSync(schemaPath, 'utf8');
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    schema = schema.replace('url      = env("DATABASE_URL")', 'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")');
    fs.writeFileSync(schemaPath, schema);
    
    console.log('✅ schema.prisma 업데이트 완료');
    console.log('⚠️  수동으로 .env.local의 DATABASE_URL을 PostgreSQL로 변경하세요');
    
  } catch (error) {
    console.error('❌ 자동 업데이트 실패:', error.message);
  }
}