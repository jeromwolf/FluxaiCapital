# PostgreSQL 설정 가이드

## 1. PostgreSQL 설치

### macOS
```bash
# Homebrew 사용
brew install postgresql@15
brew services start postgresql@15

# 또는 Postgres.app 다운로드
# https://postgresapp.com/
```

### Windows
PostgreSQL 공식 사이트에서 설치 프로그램 다운로드:
https://www.postgresql.org/download/windows/

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE fluxai_capital;

# 사용자 생성 (비밀번호는 변경하세요)
CREATE USER fluxai_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# 권한 부여
GRANT ALL PRIVILEGES ON DATABASE fluxai_capital TO fluxai_user;

# 종료
\q
```

## 3. 환경 변수 설정

`.env.local` 파일 수정:

```env
# 기존 SQLite 설정을 주석 처리
# DATABASE_URL="file:./dev.db"

# PostgreSQL 설정 (실제 값으로 변경하세요)
DATABASE_URL="postgresql://fluxai_user:your_secure_password@localhost:5432/fluxai_capital"

# SSL 연결이 필요한 경우 (프로덕션)
# DATABASE_URL="postgresql://fluxai_user:your_secure_password@localhost:5432/fluxai_capital?sslmode=require"
```

## 4. Prisma 설정 업데이트

`prisma/schema.prisma` 파일이 이미 PostgreSQL을 지원하도록 설정되어 있습니다:

```prisma
datasource db {
  provider = "postgresql"  // SQLite에서 PostgreSQL로 변경
  url      = env("DATABASE_URL")
}
```

## 5. 마이그레이션 실행

```bash
# 기존 마이그레이션 파일 삭제 (SQLite용)
rm -rf prisma/migrations

# 새로운 마이그레이션 생성
npx prisma migrate dev --name init

# Prisma Client 재생성
npx prisma generate

# 시드 데이터 입력
npm run db:seed
```

## 6. 연결 테스트

```bash
# Prisma Studio로 확인
npx prisma studio

# 또는 테스트 스크립트 실행
node test-db-connection.js
```

## 7. 프로덕션 배포 시 고려사항

### Supabase 사용 (추천)
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

### AWS RDS 사용
```env
DATABASE_URL="postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/dbname?ssl=true"
```

### Connection Pooling 설정
프로덕션 환경에서는 PgBouncer 또는 Prisma의 connection pooling 사용 권장

## 8. 백업 및 복구

### 백업
```bash
pg_dump -U fluxai_user -h localhost fluxai_capital > backup.sql
```

### 복구
```bash
psql -U fluxai_user -h localhost fluxai_capital < backup.sql
```

## 문제 해결

### 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- 방화벽 설정 확인 (5432 포트)
- pg_hba.conf 파일에서 인증 방법 확인

### 권한 오류
```sql
-- 모든 테이블에 대한 권한 부여
GRANT ALL ON ALL TABLES IN SCHEMA public TO fluxai_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fluxai_user;
```

### 성능 튜닝
- `postgresql.conf` 에서 메모리 설정 조정
- 인덱스 최적화
- VACUUM 및 ANALYZE 정기 실행