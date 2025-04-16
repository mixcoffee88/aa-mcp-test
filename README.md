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

### 2. Adobe Analytics 구성 요소 조회
- 차원 목록 API (`/dimensions`)
  - 사용 가능한 차원 목록 조회
  - 세그먼트/리포트 사용 가능 여부 필터링
  - 다국어 지원

- 지표 목록 API (`/metrics`)
  - 사용 가능한 지표 목록 조회
  - 세그먼트/리포트 사용 가능 여부 필터링
  - 다국어 지원

- 세그먼트 목록 API (`/segments`)
  - 사용 가능한 세그먼트 목록 조회
  - 게시된 세그먼트 필터링
  - 페이지네이션 지원

- 날짜 범위 목록 API (`/date-ranges`)
  - 사전 정의된 날짜 범위 조회
  - 게시된 날짜 범위 필터링
  - 다국어 지원

- 차원 값 목록 API (`/dimensions/{dimensionId}/values`)
  - 특정 차원의 값 목록 조회
  - 검색 및 페이지네이션 지원
  - 다국어 지원

### 3. 인증
- OAuth Server-to-Server(client_credentials grant) 기반 인증
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
  ADOBE_SCOPE=your_scope_1,your_scope_2
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

### 3. 차원 목록 조회
```json
{
  "name": "get_dimensions",
  "arguments": {
    "rsid": "your_report_suite_id",
    "locale": "ko_KR",
    "segmentable": true,
    "reportable": true
  }
}
```

### 4. 지표 목록 조회
```json
{
  "name": "get_metrics",
  "arguments": {
    "rsid": "your_report_suite_id",
    "locale": "ko_KR",
    "segmentable": true,
    "reportable": true
  }
}
```

### 5. 세그먼트 목록 조회
```json
{
  "name": "get_segments",
  "arguments": {
    "rsid": "your_report_suite_id",
    "locale": "ko_KR",
    "filterByPublishedSegments": true,
    "limit": 10,
    "page": 1
  }
}
```

### 6. 날짜 범위 목록 조회
```json
{
  "name": "get_date_ranges",
  "arguments": {
    "rsid": "your_report_suite_id",
    "locale": "ko_KR",
    "filterByPublishedSegments": true
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

3. MCP 설정 파일에 다음 내용 추가:
```json
{
  "mcpServers": {
    "adobe-analytics": {
      "command": "node",
      "args": ["C:/ibank/mcp_workspace/aa-mcp-test/build/index.js"],
      "env": {
        "ADOBE_CLIENT_ID": "your_client_id",
        "ADOBE_CLIENT_SECRET": "your_client_secret",
        "ADOBE_SCOPE": "your_scope_1,your_scope_2",
        "ADOBE_COMPANY_ID": "your_company_id",
        "ADOBE_REPORT_SUITE_ID": "your_report_suite_id"
      }
    }
  }
}
```
참고: 완료후 NPM 패키지로 배포 필요

