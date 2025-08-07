# Task Master MCP 설치 가이드

## 📋 Task Master MCP란?
Task Master는 Claude Desktop에서 작업 관리를 위한 MCP(Model Context Protocol) 서버입니다. 할 일 목록을 생성, 업데이트, 삭제할 수 있는 기능을 제공합니다.

## 🚀 설치 방법

### 1. Task Master MCP 설치
```bash
# Blizzy의 MCP Task Manager 설치 (추천)
npm install -g @blizzy/mcp-task-manager

# 또는 다른 옵션들:
npm install -g mcp-task-manager
npm install -g taskqueue-mcp
```

### 2. Claude Desktop 설정 파일 수정

Claude Desktop 설정 파일 위치:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

설정 파일에 다음 내용을 추가합니다:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "mcp-task-manager"
    }
  }
}
```

또는 전체 경로 지정:

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "/opt/homebrew/bin/mcp-task-manager"
    }
  }
}
```

### 3. 로컬 설치 (선택사항)

프로젝트 내에 로컬로 설치하려면:

```bash
# 프로젝트 디렉토리에서
npm install @mcp-get/task-master

# package.json에 스크립트 추가
{
  "scripts": {
    "mcp:task-master": "node node_modules/@mcp-get/task-master/dist/index.js"
  }
}
```

그리고 Claude Desktop 설정:

```json
{
  "mcpServers": {
    "task-master": {
      "command": "npm",
      "args": ["run", "mcp:task-master"],
      "cwd": "/Users/kelly/Desktop/Space/project/FluxAIcapital"
    }
  }
}
```

### 4. 설정 확인 및 재시작

1. Claude Desktop을 완전히 종료합니다
2. 다시 실행합니다
3. 새 대화에서 MCP 도구가 활성화되었는지 확인합니다

## 🔧 사용 방법

Task Master MCP가 설치되면 Claude에서 다음과 같은 기능을 사용할 수 있습니다:

### 주요 기능
- **작업 생성**: 새로운 할 일 추가
- **작업 목록 조회**: 현재 할 일 목록 확인
- **작업 업데이트**: 상태 변경 (pending → in_progress → completed)
- **작업 삭제**: 완료된 작업 제거

### 사용 예시
```
"프로젝트 초기 설정 작업을 추가해줘"
"현재 할 일 목록을 보여줘"
"첫 번째 작업을 진행 중으로 변경해줘"
"완료된 작업들을 정리해줘"
```

## 🐛 문제 해결

### Task Master가 작동하지 않는 경우

1. **Node.js 버전 확인**
   ```bash
   node --version  # v16 이상 필요
   ```

2. **권한 문제**
   ```bash
   # macOS/Linux
   chmod +x ~/.npm-global/bin/task-master
   ```

3. **경로 문제**
   ```bash
   # npm 전역 경로 확인
   npm config get prefix
   
   # PATH에 추가 (예: ~/.zshrc 또는 ~/.bashrc)
   export PATH="$PATH:$(npm config get prefix)/bin"
   ```

4. **로그 확인**
   - Claude Desktop 개발자 도구: `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Console 탭에서 MCP 관련 에러 확인

### 대안: 파일 기반 Task 관리

MCP 설치가 어려운 경우, 프로젝트 내 `TASKS.md` 파일로 관리하는 것도 좋은 방법입니다:

```markdown
# Tasks

## In Progress
- [ ] 대시보드 UI 구현

## Todo
- [ ] 인증 시스템 구축
- [ ] API 엔드포인트 설계

## Completed
- [x] 프로젝트 초기 설정
```

## 📚 추가 리소스

- [MCP 공식 문서](https://github.com/modelcontextprotocol/mcps)
- [Task Master MCP GitHub](https://github.com/mcp-get/task-master)
- [Claude Desktop MCP 가이드](https://docs.anthropic.com/claude/docs/mcp)