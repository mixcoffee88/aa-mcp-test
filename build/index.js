#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { runReport, runRealtimeReport } from './api/reports-aa.js';
const server = new Server({
    name: "mcp-server-adobe-analytics",
    version: "0.1.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_report",
                description: "Get a report from Adobe Analytics API",
                inputSchema: {
                    type: "object",
                    properties: {
                        rsid: {
                            type: "string",
                            description: "Report Suite ID"
                        },
                        startDate: {
                            type: "string",
                            description: "Start date in YYYY-MM-DD format"
                        },
                        endDate: {
                            type: "string",
                            description: "End date in YYYY-MM-DD format"
                        },
                        metrics: {
                            type: "array",
                            description: "List of metrics to include in the report",
                            items: {
                                type: "string"
                            }
                        },
                        dimension: {
                            type: "string",
                            description: "Dimension to include in the report"
                        },
                        limit: {
                            type: "number",
                            description: "Maximum number of rows to return"
                        }
                    },
                    required: ["rsid", "startDate", "endDate", "metrics"]
                }
            },
            {
                name: "get_realtime_data",
                description: "Get realtime data from Adobe Analytics API",
                inputSchema: {
                    type: "object",
                    properties: {
                        rsid: {
                            type: "string",
                            description: "Report Suite ID"
                        },
                        metrics: {
                            type: "array",
                            description: "List of metrics to include in the report",
                            items: {
                                type: "string"
                            }
                        },
                        dimension: {
                            type: "string",
                            description: "Dimension to include in the report"
                        },
                        limit: {
                            type: "number",
                            description: "Maximum number of rows to return"
                        }
                    },
                    required: ["rsid", "metrics"]
                }
            }
        ]
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "get_report": {
                const args = request.params.arguments;
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
                const args = request.params.arguments;
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
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            throw new McpError(ErrorCode.MethodNotFound, error.message);
        }
        throw new McpError(ErrorCode.MethodNotFound, 'An unknown error occurred');
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
