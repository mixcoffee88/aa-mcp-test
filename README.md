# Adobe Analytics MCP 서버

Adobe Analytics API를 MCP(Model Context Protocol)를 통해 접근할 수 있게 해주는 서버입니다.

## 주요 기능

### 1. Adobe Analytics 보고서 조회
- 일반 보고서 API (`/reports`)
  - 날짜 범위 기반 데이터 조회
  - 지표(metrics) 및 차원(dimension) 지정 가능
  - 결과 제한(limit) 설정 가능

- 실시간 보고서 API (`/reports/realtime`)
  - 실시간 데이터 조회
  - 지표 및 차원 지정 가능
  - 결과 제한 설정 가능

### 2. 인증
- JWT 기반 인증
- 액세스 토큰 자동 갱신
- 환경 변수를 통한 설정

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
- `.env` 파일 생성 후 다음 값들을 설정:
  ```env
  ADOBE_CLIENT_ID=your_client_id
  ADOBE_CLIENT_SECRET=your_client_secret
  ADOBE_JWT=your_jwt_token
  ADOBE_COMPANY_ID=your_company_id
  ADOBE_REPORT_SUITE_ID=your_report_suite_id
  ```

3. 빌드:
```bash
npm run build
```

4. 실행:
```bash
npm start
```

## API 사용 예시

### 1. 일반 보고서 조회
```json
{
  "name": "get_report",
  "arguments": {
    "rsid": "your_report_suite_id",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "metrics": ["pageviews", "visitors"],
    "dimension": "page",
    "limit": 10
  }
}
```

### 2. 실시간 보고서 조회
```json
{
  "name": "get_realtime_data",
  "arguments": {
    "rsid": "your_report_suite_id",
    "metrics": ["pageviews"],
    "dimension": "page",
    "limit": 5
  }
}
```

## 개발 환경
- Node.js
- TypeScript
- MCP SDK
- Adobe Analytics API 2.0

## 프로젝트 구조

### 1. Claude Desktop 설정

1. 프로젝트 클론:
```bash
git clone https://github.com/mixcoffee88/aa-mcp-test.git
cd aa-mcp-test
npm install
npm run build
```

2. Claude Desktop의 설정 파일 위치:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

3. 설정 파일에 다음 내용 추가:
```json
{
  "mcpServers": {
    "adobe-analytics": {
      "command": "npx",
      "args": ["ts-node", "https://github.com/mixcoffee88/aa-mcp-test.git/src/index.ts"],
      "cwd": "/path/to/aa-mcp-test",
      "env": {
        "ADOBE_CLIENT_ID": "your_client_id",
        "ADOBE_CLIENT_SECRET": "your_client_secret",
        "ADOBE_JWT": "your_jwt_token",
        "ADOBE_COMPANY_ID": "your_company_id",
        "ADOBE_REPORT_SUITE_ID": "your_report_suite_id"
      }
    }
  }
}
```

또는 빌드된 버전을 사용하려면:
```json
{
  "mcpServers": {
    "adobe-analytics": {
      "command": "node",
      "args": ["https://github.com/mixcoffee88/aa-mcp-test.git/build/index.js"],
      "cwd": "/path/to/aa-mcp-test",
      "env": {
        "ADOBE_CLIENT_ID": "your_client_id",
        "ADOBE_CLIENT_SECRET": "your_client_secret",
        "ADOBE_JWT": "your_jwt_token",
        "ADOBE_COMPANY_ID": "your_company_id",
        "ADOBE_REPORT_SUITE_ID": "your_report_suite_id"
      }
    }
  }
}
```

참고: `cwd` 경로는 클론한 프로젝트의 실제 경로로 변경해야 합니다.
