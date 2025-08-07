#!/bin/bash

# FLUX AI Capital 개발 도구 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로고 출력
print_logo() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║        FLUX AI Capital Dev Tool        ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 메뉴 출력
print_menu() {
    echo -e "${GREEN}개발 명령어:${NC}"
    echo "1) 개발 서버 실행 (Next.js)"
    echo "2) 코드 검사 (Lint + Type Check)"
    echo "3) 코드 포맷팅"
    echo "4) 데이터베이스 관리"
    echo "5) 빌드 및 프로덕션 실행"
    echo "6) 의존성 설치"
    echo "7) Git 커밋"
    echo "8) 전체 테스트"
    echo "0) 종료"
    echo ""
}

# 개발 서버 실행
run_dev() {
    echo -e "${BLUE}개발 서버를 시작합니다... (포트: 4321)${NC}"
    npm run dev
}

# 코드 검사
run_checks() {
    echo -e "${BLUE}코드 검사를 시작합니다...${NC}"
    echo -e "${YELLOW}ESLint 실행 중...${NC}"
    npm run lint
    
    echo -e "${YELLOW}TypeScript 타입 체크 중...${NC}"
    npm run type-check
    
    echo -e "${GREEN}✓ 코드 검사 완료${NC}"
}

# 코드 포맷팅
run_format() {
    echo -e "${BLUE}코드 포맷팅을 시작합니다...${NC}"
    npm run format
    echo -e "${GREEN}✓ 포맷팅 완료${NC}"
}

# 데이터베이스 메뉴
db_menu() {
    echo -e "${GREEN}데이터베이스 명령어:${NC}"
    echo "1) Prisma 클라이언트 생성"
    echo "2) 데이터베이스 푸시"
    echo "3) 마이그레이션 실행"
    echo "4) Prisma Studio 실행"
    echo "0) 뒤로 가기"
    echo ""
    
    read -p "선택: " db_choice
    
    case $db_choice in
        1)
            echo -e "${BLUE}Prisma 클라이언트 생성 중...${NC}"
            npm run db:generate
            ;;
        2)
            echo -e "${BLUE}데이터베이스 푸시 중...${NC}"
            npm run db:push
            ;;
        3)
            echo -e "${BLUE}마이그레이션 실행 중...${NC}"
            npm run db:migrate
            ;;
        4)
            echo -e "${BLUE}Prisma Studio 시작...${NC}"
            npm run db:studio
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}잘못된 선택입니다.${NC}"
            ;;
    esac
}

# 빌드 및 프로덕션
run_build() {
    echo -e "${BLUE}프로덕션 빌드를 시작합니다...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 빌드 성공${NC}"
        read -p "프로덕션 서버를 시작하시겠습니까? (y/n): " start_prod
        if [ "$start_prod" = "y" ]; then
            npm run start
        fi
    else
        echo -e "${RED}✗ 빌드 실패${NC}"
    fi
}

# 의존성 설치
install_deps() {
    echo -e "${BLUE}의존성을 설치합니다...${NC}"
    npm install
    echo -e "${GREEN}✓ 의존성 설치 완료${NC}"
}

# Git 커밋
git_commit() {
    echo -e "${BLUE}Git 상태 확인...${NC}"
    git status
    
    read -p "계속 진행하시겠습니까? (y/n): " proceed
    if [ "$proceed" != "y" ]; then
        return
    fi
    
    echo -e "${YELLOW}변경 사항을 추가합니다...${NC}"
    git add .
    
    read -p "커밋 메시지를 입력하세요: " commit_msg
    git commit -m "$commit_msg"
    
    echo -e "${GREEN}✓ 커밋 완료${NC}"
}

# 전체 테스트
run_tests() {
    echo -e "${BLUE}전체 테스트를 실행합니다...${NC}"
    
    echo -e "${YELLOW}1. 코드 포맷 확인...${NC}"
    npm run format:check
    
    echo -e "${YELLOW}2. ESLint 검사...${NC}"
    npm run lint
    
    echo -e "${YELLOW}3. TypeScript 타입 체크...${NC}"
    npm run type-check
    
    echo -e "${YELLOW}4. 빌드 테스트...${NC}"
    npm run build
    
    echo -e "${GREEN}✓ 모든 테스트 완료${NC}"
}

# 메인 루프
main() {
    print_logo
    
    while true; do
        print_menu
        read -p "선택: " choice
        
        case $choice in
            1)
                run_dev
                ;;
            2)
                run_checks
                ;;
            3)
                run_format
                ;;
            4)
                db_menu
                ;;
            5)
                run_build
                ;;
            6)
                install_deps
                ;;
            7)
                git_commit
                ;;
            8)
                run_tests
                ;;
            0)
                echo -e "${GREEN}개발 도구를 종료합니다.${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}잘못된 선택입니다.${NC}"
                ;;
        esac
        
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
        clear
        print_logo
    done
}

# 스크립트 실행
main