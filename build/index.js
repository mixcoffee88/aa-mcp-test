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
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { runReport, runRealtimeReport, runDimensions, runMetrics, runSegments, runDateRanges } from './api/adobe-analytics.js';
// MCP 서버 인스턴스 생성
const server = new Server({
    name: "mcp-server-adobe-analytics",
    version: "0.1.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
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
                            description: "측정할 지표 ID 목록 (예: ['metrics/pageviews', 'metrics/visits'])",
                            items: {
                                type: "string"
                            }
                        },
                        dimension: {
                            type: "string",
                            description: "데이터를 분류할 차원 ID (예: 'variables/page', 'variables/browser')",
                        },
                        limit: {
                            type: "number",
                            description: "결과 항목 수 제한 (예: 10 → 상위 10개만 반환)"
                        }
                    },
                    required: ["dimension"]
                },
                outputSchema: {
                    type: "object",
                    description: "Adobe Analytics 표준 보고서 결과",
                    properties: {
                        totalPages: {
                            type: "integer",
                            description: "데이터가 포함된 총 페이지 수"
                        },
                        firstPage: {
                            type: "boolean",
                            description: "응답이 첫 번째 페이지인지 여부"
                        },
                        lastPage: {
                            type: "boolean",
                            description: "응답이 마지막 페이지인지 여부"
                        },
                        numberOfElements: {
                            type: "integer",
                            description: "현재 페이지의 항목 수"
                        },
                        number: {
                            type: "integer",
                            description: "현재 페이지 번호 (0부터 시작)"
                        },
                        totalElements: {
                            type: "integer",
                            description: "전체 항목 수"
                        },
                        columns: {
                            type: "object",
                            description: "차원 및 컬럼 정보",
                            properties: {
                                dimension: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            description: "차원 ID (예: variables/page)"
                                        },
                                        type: {
                                            type: "string",
                                            description: "차원 데이터 타입 (예: string)"
                                        }
                                    }
                                },
                                columnIds: {
                                    type: "array",
                                    description: "표에 표시되는 지표의 컬럼 ID 목록 (왼쪽부터 0번)",
                                    items: {
                                        type: "string"
                                    }
                                }
                            }
                        },
                        rows: {
                            type: "array",
                            description: "보고서 결과 데이터 행 목록",
                            items: {
                                type: "object",
                                properties: {
                                    itemId: {
                                        type: "string",
                                        description: "데이터 항목 고유 ID"
                                    },
                                    value: {
                                        type: "string",
                                        description: "itemId에 해당하는 텍스트 값 (예: 'home')"
                                    },
                                    data: {
                                        type: "array",
                                        description: "지표별 값 배열 (예: pageViews, visits 등)",
                                        items: {
                                            type: "number"
                                        }
                                    }
                                }
                            }
                        },
                        summaryData: {
                            type: "object",
                            description: "전체 요약 통계 데이터",
                            properties: {
                                filteredTotals: {
                                    type: "array",
                                    description: "필터가 적용된 총합 데이터",
                                    items: {
                                        type: "number"
                                    }
                                },
                                annotations: {
                                    type: "array",
                                    description: "지표별 주석 정보 (없을 경우 빈 배열)",
                                    items: {
                                        type: "string"
                                    }
                                },
                                totals: {
                                    type: "array",
                                    description: "필터 미적용 상태의 전체 총합",
                                    items: {
                                        type: "number"
                                    }
                                },
                                annotationExceptions: {
                                    type: "array",
                                    description: "주석 처리 예외 정보",
                                    items: {
                                        type: "string"
                                    }
                                },
                                "col-max": {
                                    type: "array",
                                    description: "각 지표 컬럼의 최대값",
                                    items: {
                                        type: "number"
                                    }
                                },
                                "col-min": {
                                    type: "array",
                                    description: "각 지표 컬럼의 최소값",
                                    items: {
                                        type: "number"
                                    }
                                }
                            }
                        }
                    }
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
                            description: "조회할 실시간 지표 목록 (예: ['realtime:activeUsers'])",
                            items: {
                                type: "string"
                            }
                        },
                        dimensions: {
                            type: "array",
                            description: "실시간 데이터를 분류할 차원 목록 (예: ['variables/geoCountry'])",
                            items: {
                                type: "string"
                            }
                        },
                        limit: {
                            type: "number",
                            description: "결과 항목 수 제한 (예: 5)"
                        }
                    },
                    required: ["metrics", "dimensions"]
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
                },
                outputSchema: {
                    type: "object",
                    description: "Adobe Analytics 실시간 보고서 결과",
                    properties: {
                        totalPages: {
                            type: "integer",
                            description: "전체 페이지 수"
                        },
                        firstPage: {
                            type: "boolean",
                            description: "이 응답이 첫 번째 페이지인지 여부"
                        },
                        lastPage: {
                            type: "boolean",
                            description: "이 응답이 마지막 페이지인지 여부"
                        },
                        numberOfElements: {
                            type: "integer",
                            description: "현재 페이지에 포함된 데이터 항목 수"
                        },
                        number: {
                            type: "integer",
                            description: "현재 페이지 번호 (0부터 시작)"
                        },
                        totalElements: {
                            type: "integer",
                            description: "전체 데이터 항목 수"
                        },
                        rows: {
                            type: "array",
                            description: "각 데이터 행 (시간대, 값, 수치 등 포함)",
                            items: {
                                type: "object",
                                properties: {
                                    itemIds: {
                                        type: "array",
                                        description: "시간 값에 해당하는 처리 ID 목록",
                                        items: { type: "string" }
                                    },
                                    values: {
                                        type: "array",
                                        description: "시간대 또는 항목 값 문자열 (예: '09:00 YYYY-MM-DD')",
                                        items: { type: "string" }
                                    },
                                    data: {
                                        type: "array",
                                        description: "각 값에 대응하는 수치 데이터 (예: 발생 수)",
                                        items: { type: "number" }
                                    },
                                    value: {
                                        type: "string",
                                        description: "주요 표시용 값 (values의 첫 번째 값과 동일한 경우가 많음)"
                                    },
                                    itemId: {
                                        type: "string",
                                        description: "대표 item ID (itemIds 중 하나)"
                                    }
                                }
                            }
                        },
                        summaryData: {
                            type: "object",
                            description: "전체 데이터 요약 정보",
                            properties: {
                                totals: {
                                    type: "array",
                                    description: "모든 행을 합산한 총합 (예: 전체 발생 수)",
                                    items: { type: "number" }
                                }
                            }
                        }
                    }
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
                },
                outputSchema: {
                    type: "array",
                    description: "Adobe Analytics에서 조회된 지표(Metrics) 목록",
                    items: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "지표 고유 ID (예: metrics/cartadditions)"
                            },
                            title: {
                                type: "string",
                                description: "지표의 사용자 친화적인 제목 (UI에 표시되는 이름)"
                            },
                            name: {
                                type: "string",
                                description: "지표의 내부 이름 (보통 title과 동일)"
                            },
                            type: {
                                type: "string",
                                description: "지표 값의 데이터 타입 (예: int, float, percent)"
                            },
                            category: {
                                type: "string",
                                description: "지표가 속한 카테고리 (예: Conversion, Traffic Sources)"
                            },
                            support: {
                                type: "array",
                                description: "지원되는 플랫폼 (예: 'oberon', 'dataWarehouse')",
                                items: { type: "string" }
                            },
                            allocation: {
                                type: "boolean",
                                description: "지표에 할당 방식(allocation method)이 적용되는지 여부"
                            },
                            precision: {
                                type: "integer",
                                description: "지표 값의 정밀도 (소수점 자리 수 등)"
                            },
                            calculated: {
                                type: "boolean",
                                description: "계산된 지표인지 여부"
                            },
                            segmentable: {
                                type: "boolean",
                                description: "세그먼트 조건으로 사용할 수 있는 지표인지 여부"
                            },
                            supportsDataGovernance: {
                                type: "boolean",
                                description: "데이터 거버넌스 정책 적용 여부"
                            },
                            polarity: {
                                type: "string",
                                description: "지표의 극성 (positive | negative)"
                            },
                            allowedForReporting: {
                                type: "boolean",
                                description: "이 지표가 리포팅에서 사용 가능한지 여부"
                            },
                            standardComponent: {
                                type: "boolean",
                                description: "표준 제공 지표인지 여부"
                            },
                            description: {
                                type: "string",
                                description: "지표 설명 (예: 전환 퍼널 단계에서 장바구니 추가 횟수)"
                            }
                        }
                    }
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
                },
                outputSchema: {
                    type: "array",
                    description: "사용자 정의 및 공유된 세그먼트 목록",
                    items: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "세그먼트 고유 ID (예: s300000022_5bb7c94e80f0073611afb35c)"
                            },
                            name: {
                                type: "string",
                                description: "세그먼트 이름 (예: Example segment)"
                            },
                            description: {
                                type: "string",
                                description: "세그먼트에 대한 설명 (비어있을 수 있음)"
                            },
                            rsid: {
                                type: "string",
                                description: "이 세그먼트가 속한 Report Suite ID"
                            },
                            owner: {
                                type: "object",
                                description: "세그먼트를 생성한 사용자 정보",
                                properties: {
                                    id: {
                                        type: "integer",
                                        description: "사용자 ID (예: Adobe IMS 사용자 번호)"
                                    }
                                }
                            }
                        }
                    }
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
                        // filterByPublishedSegments: {
                        //   type: "boolean",
                        //   description: "게시된 세그먼트만 필터링 (true일 경우 공유된 세그먼트만 포함)"
                        // }
                    },
                    required: []
                },
                outputSchema: {
                    type: "object",
                    description: "사용자 정의 날짜 범위 목록 및 페이징 정보",
                    properties: {
                        content: {
                            type: "array",
                            description: "날짜 범위 항목 리스트",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                        description: "날짜 범위 고유 ID (예: 5e79255b4201ce1b3cfd7b2b)"
                                    },
                                    name: {
                                        type: "string",
                                        description: "날짜 범위의 이름"
                                    },
                                    description: {
                                        type: "string",
                                        description: "날짜 범위에 대한 설명"
                                    },
                                    owner: {
                                        type: "object",
                                        description: "이 범위를 만든 사용자 정보",
                                        properties: {
                                            id: {
                                                type: "integer",
                                                description: "사용자 ID (Adobe IMS ID)"
                                            }
                                        }
                                    },
                                    createDate: {
                                        type: ["string", "null"],
                                        description: "생성일 (ISO 8601 형식 또는 null)"
                                    },
                                    disabledDate: {
                                        type: ["string", "null"],
                                        description: "비활성화된 날짜 (없으면 null)"
                                    }
                                }
                            }
                        },
                        totalElements: {
                            type: "integer",
                            description: "전체 날짜 범위 항목 수"
                        },
                        totalPages: {
                            type: "integer",
                            description: "전체 페이지 수"
                        },
                        numberOfElements: {
                            type: "integer",
                            description: "현재 페이지의 항목 수"
                        },
                        number: {
                            type: "integer",
                            description: "현재 페이지 번호 (0부터 시작)"
                        },
                        firstPage: {
                            type: "boolean",
                            description: "첫 번째 페이지 여부"
                        },
                        lastPage: {
                            type: "boolean",
                            description: "마지막 페이지 여부"
                        },
                        sort: {
                            type: ["null", "object"],
                            description: "정렬 조건 (없으면 null)"
                        },
                        size: {
                            type: "integer",
                            description: "페이지당 항목 수"
                        }
                    }
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
                const args = request.params.arguments;
                // Adobe Analytics 보고서 API 호출
                const response = await runReport({
                    globalFilters: [{
                            type: "dateRange",
                            dateRange: `${args.startDate}T00:00:00.000/${args.endDate}T00:00:00.000`
                        }],
                    metricContainer: {
                        metrics: (args.metrics || []).map((id, index) => ({
                            columnId: String(index),
                            id
                        }))
                    },
                    dimension: args.dimension,
                    settings: {
                        countRepeatInstances: true,
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
                const args = request.params.arguments;
                // Adobe Analytics 실시간 보고서 API 호출
                const response = await runRealtimeReport({
                    globalFilters: [{
                            type: "dateRange",
                            dateRange: `${args.startDate}T00:00:00.000/${args.endDate}T00:00:00.000`
                        }],
                    metricContainer: {
                        metrics: (args.metrics || []).map((id, index) => ({
                            columnId: String(index),
                            id
                        }))
                    },
                    dimensions: (args.dimensions || []).map((id, index) => ({
                        dimensionColumnId: String(index),
                        id
                    })),
                    settings: {
                        realTimeMinuteGranularity: 10,
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
            case "get_dimensions": {
                const args = request.params.arguments;
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
                const args = request.params.arguments;
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
                const args = request.params.arguments;
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
                const args = request.params.arguments;
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
            default:
                throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구입니다: ${request.params.name}`);
        }
    }
    catch (error) {
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
