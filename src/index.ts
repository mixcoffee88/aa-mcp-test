#!/usr/bin/env node

/**
 * Adobe Analytics MCP 서버
 * 
 * Adobe Analytics API를 MCP(Model Context Protocol)를 통해 접근할 수 있게 해주는 서버입니다.
 * 다음과 같은 기능들을 제공합니다:
 * 1. 일반 보고서 조회 (get_report)
 * 2. 실시간 보고서 조회 (get_realtime_data)
 * 3. 차원 목록 조회 (get_dimensions)
 * 4. 지표 목록 조회 (get_metrics)
 * 5. 세그먼트 목록 조회 (get_segments)
 * 6. 날짜 범위 목록 조회 (get_date_ranges)
 * 7. 차원 값 목록 조회 (get_dimension_values)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { 
  runReport, 
  runRealtimeReport,
  runDimensions,
  runMetrics,
  runSegments,
  runDateRanges,
  runDimensionValues
} from './api/adobe-analytics.js';

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
        description: "Adobe Analytics에서 특정 날짜 범위 동안 메트릭과 차원을 기반으로 표준 보고서를 생성합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:production)."
            // },
            startDate: {
              type: "string",
              description: "보고서의 시작 날짜 (형식: YYYY-MM-DD, 예: 2024-01-01)"
            },
            endDate: {
              type: "string",
              description: "보고서의 종료 날짜 (형식: YYYY-MM-DD, 예: 2024-01-31)"
            },
            metrics: {
              type: "array",
              description: "측정할 지표 ID 목록 (예: ['metrics/pageViews', 'metrics/visits'])",
              items: {
                type: "string"
              }
            },
            dimension: {
              type: "string",
              description: "데이터를 분류할 차원 ID (예: 'variables/evar1', 'variables/country')"
            },
            limit: {
              type: "number",
              description: "결과 항목 수 제한 (예: 10 → 상위 10개만 반환)"
            }
          },
          required: ["startDate", "endDate", "metrics"]
        }
      },
      {
        name: "get_realtime_data",
        description: "Adobe Analytics 실시간 API를 사용하여 현재 트래픽 데이터(예: 실시간 방문자 수)를 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            metrics: {
              type: "array",
              description: "조회할 실시간 지표 목록 (예: ['realtime:activeUsers'])",
              items: {
                type: "string"
              }
            },
            dimension: {
              type: "string",
              description: "실시간 데이터를 분류할 차원 (예: 'variables/geoCountry')",
            },
            limit: {
              type: "number",
              description: "결과 항목 수 제한 (예: 5)"
            }
          },
          required: ["metrics"]
        }
      },
      {
        name: "get_dimensions",
        description: "지정한 Report Suite에서 사용 가능한 모든 차원(Dimensions)을 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            locale: {
              type: "string",
              description: "결과 설명의 언어 설정 (예: 'en_US' → 영어, 'ko_KR' → 한국어)"
            },
            segmentable: {
              type: "boolean",
              description: "세그먼트 조건으로 사용 가능한 차원만 포함 (true일 경우)"
            },
            reportable: {
              type: "boolean",
              description: "보고서에서 사용 가능한 차원만 포함 (true일 경우)"
            }
          },
          required: []
        }
      },
      {
        name: "get_metrics",
        description: "Report Suite에서 사용 가능한 지표(Metrics)를 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            locale: {
              type: "string",
              description: "결과 설명의 언어 설정 (예: 'en_US' → 영어, 'ko_KR' → 한국어)"
            },
            segmentable: {
              type: "boolean",
              description: "세그먼트 조건으로 사용할 수 있는 지표만 포함"
            },
            reportable: {
              type: "boolean",
              description: "보고서에서 사용할 수 있는 지표만 포함"
            }
          },
          required: []
        }
      },
      {
        name: "get_segments",
        description: "사용자 정의 및 공유된 세그먼트 목록을 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            locale: {
              type: "string",
              description: "결과 설명의 언어 설정 (예: 'en_US' → 영어, 'ko_KR' → 한국어)"
            },
            filterByPublishedSegments: {
              type: "boolean",
              description: "게시된 세그먼트만 필터링 (true일 경우 공유된 세그먼트만 포함)"
            },
            limit: {
              type: "number",
              description: "페이지당 항목 수(예: 5)"
            },
            page: {
              type: "number",
              description: "페이지 번호"
            }
          },
          required: []
        }
      },
      {
        name: "get_date_ranges",
        description: "사전 정의된 사용자 지정 날짜 범위(예: '지난 7일', '이번 달')를 조회합니다.",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            locale: {
              type: "string",
              description: "결과 설명의 언어 설정 (예: 'en_US' → 영어, 'ko_KR' → 한국어)"
            },
            filterByPublishedSegments: {
              type: "boolean",
              description: "게시된 세그먼트만 필터링 (true일 경우 공유된 세그먼트만 포함)"
            }
          },
          required: []
        }
      },
      {
        name: "get_dimension_values",
        description: "특정 차원에 해당하는 가능한 값 목록을 조회합니다 (예: 국가 목록, 브라우저 유형 목록 등).",
        inputSchema: {
          type: "object",
          properties: {
            // rsid: {
            //   type: "string",
            //   description: "데이터를 조회할 Report Suite ID (예: yourcompany:webapp)"
            // },
            dimensionId: {
              type: "string",
              description: "차원 항목의 고유 ID입니다 (예: 국가별 분석 시 'variables/country'). 차원 ID는 get_dimensions API를 통해 조회할 수 있습니다."
            },
            locale: {
              type: "string",
              description: "결과 설명의 언어 설정 (예: 'en_US' → 영어, 'ko_KR' → 한국어)"
            },
            search: {
              type: "string",
              description: "특정 값을 필터링할 키워드 (예: 'Korea' 입력 시 대한민국 관련 값 검색)"
            },
            page: {
              type: "number",
              description: "페이지 번호"
            },
            limit: {
              type: "number",
              description: "페이지당 항목 수(예: 5)"
            }
          },
          required: ["dimensionId"]
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
          startDate: string;
          endDate: string;
          metrics: string[];
          dimension?: string;
          limit?: number;
        };

        // Adobe Analytics 보고서 API 호출
        const response = await runReport({
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
          metrics: string[];
          dimension?: string;
          limit?: number;
        };

        // Adobe Analytics 실시간 보고서 API 호출
        const response = await runRealtimeReport({
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

      case "get_dimensions": {
        const args = request.params.arguments as {
          locale?: string;
          segmentable?: boolean;
          reportable?: boolean;
        };

        const response = await runDimensions(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      case "get_metrics": {
        const args = request.params.arguments as {
          locale?: string;
          segmentable?: boolean;
          reportable?: boolean;
        };

        const response = await runMetrics(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      case "get_segments": {
        const args = request.params.arguments as {
          locale?: string;
          filterByPublishedSegments?: boolean;
          limit?: number;
          page?: number;
        };

        const response = await runSegments(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      case "get_date_ranges": {
        const args = request.params.arguments as {
          locale?: string;
          filterByPublishedSegments?: boolean;
        };

        const response = await runDateRanges(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      }

      case "get_dimension_values": {
        const args = request.params.arguments as {
          dimensionId: string;
          locale?: string;
          search?: string;
          page?: number;
          limit?: number;
        };

        const response = await runDimensionValues(args);
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