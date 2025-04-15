#!/usr/bin/env node

/**
 * Adobe Analytics MCP 서버
 * 
 * Adobe Analytics API를 MCP(Model Context Protocol)를 통해 접근할 수 있게 해주는 서버입니다.
 * 두 가지 주요 기능을 제공합니다:
 * 1. 일반 보고서 조회 (get_report)
 * 2. 실시간 보고서 조회 (get_realtime_data)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { runReport, runRealtimeReport } from './api/reports-aa.js';

// MCP 서버 인스턴스 생성
const server = new Server(
  {
    name: "mcp-server-adobe-analytics",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * 사용 가능한 도구 목록을 반환하는 핸들러
 * Adobe Analytics API에서 사용할 수 있는 도구들을 노출합니다.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_report",
        description: "Adobe Analytics API에서 보고서를 조회합니다",
        inputSchema: {
          type: "object",
          properties: {
            rsid: {
              type: "string",
              description: "Report Suite ID (보고서 세트 ID)"
            },
            startDate: {
              type: "string",
              description: "조회 시작 날짜 (YYYY-MM-DD 형식)"
            },
            endDate: {
              type: "string",
              description: "조회 종료 날짜 (YYYY-MM-DD 형식)"
            },
            metrics: {
              type: "array",
              description: "조회할 지표 목록",
              items: {
                type: "string"
              }
            },
            dimension: {
              type: "string",
              description: "조회할 차원"
            },
            limit: {
              type: "number",
              description: "반환할 최대 행 수"
            }
          },
          required: ["rsid", "startDate", "endDate", "metrics"]
        }
      },
      {
        name: "get_realtime_data",
        description: "Adobe Analytics API에서 실시간 데이터를 조회합니다",
        inputSchema: {
          type: "object",
          properties: {
            rsid: {
              type: "string",
              description: "Report Suite ID (보고서 세트 ID)"
            },
            metrics: {
              type: "array",
              description: "조회할 지표 목록",
              items: {
                type: "string"
              }
            },
            dimension: {
              type: "string",
              description: "조회할 차원"
            },
            limit: {
              type: "number",
              description: "반환할 최대 행 수"
            }
          },
          required: ["rsid", "metrics"]
        }
      }
    ]
  };
});

/**
 * 도구 실행을 처리하는 핸들러
 * Adobe Analytics API 도구들의 실제 구현을 담당합니다.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_report": {
        const args = request.params.arguments as {
          rsid: string;
          startDate: string;
          endDate: string;
          metrics: string[];
          dimension?: string;
          limit?: number;
        };

        // Adobe Analytics 보고서 API 호출
        const response = await runReport({
          rsid: args.rsid,
          globalFilters: {
            dateRange: {
              startDate: args.startDate,
              endDate: args.endDate
            }
          },
          metricContainer: {
            metrics: args.metrics.map(id => ({ id }))
          },
          dimension: args.dimension,
          settings: {
            limit: args.limit
          }
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      case "get_realtime_data": {
        const args = request.params.arguments as {
          rsid: string;
          metrics: string[];
          dimension?: string;
          limit?: number;
        };

        // Adobe Analytics 실시간 보고서 API 호출
        const response = await runRealtimeReport({
          rsid: args.rsid,
          metrics: args.metrics,
          dimension: args.dimension,
          limit: args.limit
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구입니다: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new McpError(ErrorCode.MethodNotFound, error.message);
    }
    throw new McpError(ErrorCode.MethodNotFound, '알 수 없는 오류가 발생했습니다');
  }
});

/**
 * 서버를 시작하고 표준 입출력을 통해 통신합니다.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('서버 오류:', error);
  process.exit(1);
});

// src/index.ts에 추가
process.on('uncaughtException', (err) => {
  console.error('⚠️ [Critical] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Critical] Unhandled Rejection at:', promise, 'reason:', reason);
});