# 추천 MCP 서버 목록

## 🚀 필수 MCP 서버들

### 1. **Filesystem MCP** 
파일 시스템 접근 및 관리
```bash
npm install -g @modelcontextprotocol/server-filesystem
```
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kelly/Desktop"]
  }
}
```

### 2. **GitHub MCP**
GitHub 저장소 관리 및 PR 생성
```bash
npm install -g @modelcontextprotocol/server-github
```
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
    }
  }
}
```

### 3. **Google Drive MCP**
Google Drive 파일 접근 및 관리
```bash
npm install -g @modelcontextprotocol/server-gdrive
```
```json
{
  "gdrive": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-gdrive"],
    "env": {
      "GDRIVE_API_KEY": "your-api-key"
    }
  }
}
```

## 💻 개발자 도구

### 4. **Git MCP**
Git 명령어 실행 및 저장소 관리
```bash
npm install -g @modelcontextprotocol/server-git
```
```json
{
  "git": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git"]
  }
}
```

### 5. **PostgreSQL MCP**
PostgreSQL 데이터베이스 관리
```bash
npm install -g @modelcontextprotocol/server-postgres
```
```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
  }
}
```

### 6. **Puppeteer MCP**
웹 스크래핑 및 브라우저 자동화
```bash
npm install -g @modelcontextprotocol/server-puppeteer
```
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
  }
}
```

## 📊 생산성 도구

### 7. **Notion MCP**
Notion 페이지 및 데이터베이스 관리
```bash
npm install -g @modelcontextprotocol/server-notion
```
```json
{
  "notion": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-notion"],
    "env": {
      "NOTION_API_KEY": "your-notion-api-key"
    }
  }
}
```

### 8. **Slack MCP**
Slack 메시지 전송 및 채널 관리
```bash
npm install -g @modelcontextprotocol/server-slack
```
```json
{
  "slack": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-your-token",
      "SLACK_TEAM_ID": "your-team-id"
    }
  }
}
```

### 9. **Memory MCP**
대화 중 정보 저장 및 검색
```bash
npm install -g @modelcontextprotocol/server-memory
```
```json
{
  "memory": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

## 🎯 프로젝트 특화 추천

### 10. **Todoist MCP** (할 일 관리)
```bash
npm install -g @kydycode/todoist-mcp-server-ext
```
```json
{
  "todoist": {
    "command": "npx",
    "args": ["-y", "@kydycode/todoist-mcp-server-ext"],
    "env": {
      "TODOIST_API_TOKEN": "your-token"
    }
  }
}
```

### 11. **Microsoft 365 MCP**
Microsoft 365 서비스 통합
```bash
npm install -g @softeria/ms-365-mcp-server
```
```json
{
  "ms365": {
    "command": "npx",
    "args": ["-y", "@softeria/ms-365-mcp-server"],
    "env": {
      "MS_CLIENT_ID": "your-client-id",
      "MS_CLIENT_SECRET": "your-secret"
    }
  }
}
```

## 📝 전체 설정 예시

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "mcp-task-manager"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kelly/Desktop"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## 🔧 설치 팁

1. **필수 설치 순서**:
   - Task Manager (작업 관리)
   - Filesystem (파일 접근)
   - GitHub (버전 관리)
   - Memory (정보 저장)

2. **토큰 관리**:
   - 환경 변수로 관리하거나
   - `.env` 파일 사용 권장

3. **성능 최적화**:
   - 필요한 MCP만 선택적으로 활성화
   - 자주 사용하는 것만 설치

4. **문제 해결**:
   - Claude Desktop 재시작 필수
   - 개발자 도구에서 로그 확인
   - 권한 문제 시 sudo 사용

## 🔥 고급 MCP 서버들

### 12. **Desktop Commander**
데스크톱 앱 자동화 및 제어
```bash
npm install -g desktop-commander-mcp
```
```json
{
  "desktop-commander": {
    "command": "desktop-commander-mcp"
  }
}
```

### 13. **Playwright MCP**
고급 웹 자동화 및 테스팅 (Puppeteer보다 강력)
```bash
npm install -g @modelcontextprotocol/server-playwright
```
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-playwright"]
  }
}
```

### 14. **Context7 MCP (Upstash)**
고급 컨텍스트 관리 및 메모리
```bash
npm install -g @upstash/context7-mcp
```
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"],
    "env": {
      "UPSTASH_REDIS_REST_URL": "your-upstash-url",
      "UPSTASH_REDIS_REST_TOKEN": "your-upstash-token"
    }
  }
}
```

### 15. **Sequential Thinking MCP**
체계적 사고 및 단계별 문제 해결
```bash
npm install -g @modelcontextprotocol/server-sequential-thinking
```
```json
{
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  }
}
```

### 16. **Supabase MCP**
Supabase 데이터베이스 및 인증 관리
```bash
npm install -g @supabase/mcp-server-supabase
```
```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase"],
    "env": {
      "SUPABASE_URL": "your-project-url",
      "SUPABASE_SERVICE_ROLE_KEY": "your-service-key"
    }
  }
}
```

## 🌟 Kailya Arc 프로젝트용 추천 조합

### 최종 추천 설정 (Kelly님 맞춤)

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "mcp-task-manager"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kelly/Desktop"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "desktop-commander": {
      "command": "desktop-commander-mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "UPSTASH_REDIS_REST_URL": "your-upstash-url",
        "UPSTASH_REDIS_REST_TOKEN": "your-upstash-token"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-key"
      }
    }
  }
}
```

### 설치 스크립트 (한번에 설치)

```bash
#!/bin/bash
# install-mcp-servers.sh

echo "🚀 Installing MCP servers..."

# 기본 MCP 서버들
npm install -g @blizzy/mcp-task-manager
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-memory

# Kelly님이 원하는 추가 MCP 서버들
npm install -g desktop-commander-mcp
npm install -g @modelcontextprotocol/server-playwright
npm install -g context7-mcp
npm install -g sequential-thinking-mcp
npm install -g @modelcontextprotocol/server-supabase

# 추가 유용한 서버들
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-postgres

echo "✅ MCP servers installation complete!"
echo "⚠️  Don't forget to:"
echo "1. Update Claude Desktop config at ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "2. Add your API tokens (GitHub, Supabase, etc.)"
echo "3. Restart Claude Desktop"
```

## 🎯 Kelly님 프로젝트 최적 조합

1. **핵심 개발 도구**:
   - Task Manager (작업 관리)
   - Sequential Thinking (체계적 개발)
   - Context7 (고급 컨텍스트 관리)
   - Filesystem (파일 접근)

2. **자동화 & 테스팅**:
   - Desktop Commander (데스크톱 자동화)
   - Playwright (웹 자동화 & E2E 테스트)

3. **데이터 & 백엔드**:
   - Supabase (데이터베이스 & 인증)
   - GitHub (버전 관리)

4. **고급 기능**:
   - Memory (정보 저장)
   - Sequential Thinking (복잡한 작업 분해)