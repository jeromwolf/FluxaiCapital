#!/bin/bash

echo "🚀 Kelly님을 위한 MCP 서버 설치 시작..."

# 기본 MCP 서버들
echo "📦 기본 MCP 서버 설치 중..."
npm install -g @blizzy/mcp-task-manager
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-git

# Kelly님이 원하는 특별한 MCP 서버들
echo "🔥 고급 MCP 서버 설치 중..."
# Desktop Commander - 찾을 수 없음, 대체 서버 필요
# npm install -g desktop-commander-mcp

# Playwright - Puppeteer로 대체 가능
# npm install -g @modelcontextprotocol/server-playwright

# Context7 - Upstash 버전 사용
npm install -g @upstash/context7-mcp

# Sequential Thinking
npm install -g @modelcontextprotocol/server-sequential-thinking

# Supabase
npm install -g @supabase/mcp-server-supabase

# 추가 유용한 서버들
echo "🎯 추가 서버 설치 중..."
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-puppeteer

echo "✅ MCP 서버 설치 완료!"
echo ""
echo "⚠️  다음 단계:"
echo "1. Claude Desktop 설정 파일 열기:"
echo "   open ~/Library/Application\ Support/Claude/claude_desktop_config.json"
echo ""
echo "2. RECOMMENDED_MCP_SERVERS.md 파일의 설정 복사하여 붙여넣기"
echo ""
echo "3. API 토큰 설정:"
echo "   - GitHub Personal Access Token"
echo "   - Supabase URL & Service Key"
echo ""
echo "4. Claude Desktop 재시작"
echo ""
echo "🎉 완료되면 모든 MCP 기능을 사용할 수 있습니다!"