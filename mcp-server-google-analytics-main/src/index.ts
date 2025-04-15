#!/usr/bin/env node
/**
 * Google Analytics Data API MCP Server
 * 
 * This server provides access to Google Analytics Data API through the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { analyticsdata_v1beta } from 'googleapis';
import { getDefaultPropertyId } from './auth/google-auth.js';
import { runReport, runRealtimeReport } from './api/reports.js';

/**
 * Create an MCP server for Google Analytics Data API
 */
const server = new Server(
  {
    name: "mcp-server-google-analytics",
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
 * Handler for listing available tools.
 * Exposes tools for Google Analytics Data API.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_report",
        description: "Get a report from Google Analytics Data API",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "Google Analytics property ID (without 'properties/' prefix)"
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
            dimensions: {
              type: "array",
              description: "List of dimensions to include in the report",
              items: {
                type: "string"
              }
            },
            limit: {
              type: "number",
              description: "Maximum number of rows to return"
            }
          },
          required: ["startDate", "endDate", "metrics"]
        }
      },
      {
        name: "get_realtime_data",
        description: "Get realtime data from Google Analytics Data API",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "Google Analytics property ID (without 'properties/' prefix)"
            },
            metrics: {
              type: "array",
              description: "List of metrics to include in the report",
              items: {
                type: "string"
              }
            },
            dimensions: {
              type: "array",
              description: "List of dimensions to include in the report",
              items: {
                type: "string"
              }
            },
            limit: {
              type: "number",
              description: "Maximum number of rows to return"
            }
          },
          required: ["metrics"]
        }
      }
    ]
  };
});

/**
 * Handler for tool execution.
 * Implements the Google Analytics Data API tools.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_report": {
        const args = request.params.arguments as {
          propertyId?: string;
          startDate: string;
          endDate: string;
          metrics: string[];
          dimensions?: string[];
          limit?: number;
        };

        // Validate required parameters
        if (!args.startDate || !args.endDate || !args.metrics || args.metrics.length === 0) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Missing required parameters: startDate, endDate, and metrics are required"
          );
        }

        // Format metrics and dimensions for the API
        const metricsFormatted = args.metrics.map(name => ({ name }));
        const dimensionsFormatted = args.dimensions?.map(name => ({ name }));

        // Run the report
        const response = await runReport({
          propertyId: args.propertyId,
          dateRanges: [{ startDate: args.startDate, endDate: args.endDate }],
          metrics: metricsFormatted,
          dimensions: dimensionsFormatted,
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

      case "get_realtime_data": {
        const args = request.params.arguments as {
          propertyId?: string;
          metrics: string[];
          dimensions?: string[];
          limit?: number;
        };

        // Validate required parameters
        if (!args.metrics || args.metrics.length === 0) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Missing required parameters: metrics is required"
          );
        }

        // Format metrics and dimensions for the API
        const metricsFormatted = args.metrics.map(name => ({ name }));
        const dimensionsFormatted = args.dimensions?.map(name => ({ name }));

        // Run the realtime report
        const response = await runRealtimeReport({
          propertyId: args.propertyId,
          metrics: metricsFormatted,
          dimensions: dimensionsFormatted,
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
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error) {
    console.error(`Error executing tool ${request.params.name}:`, error);
    
    if (error instanceof McpError) {
      throw error;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool: ${(error as Error).message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * Handler for listing available resources.
 * Exposes Google Analytics metadata as resources.
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const propertyId = getDefaultPropertyId();
    
    return {
      resources: [
        {
          uri: `ga4://property/${propertyId}/metadata`,
          mimeType: "application/json",
          name: "Google Analytics Metadata",
          description: "Metadata about the Google Analytics property"
        }
      ]
    };
  } catch (error) {
    console.error("Error listing resources:", error);
    return { resources: [] };
  }
});

/**
 * Handler for reading resources.
 * Implements access to Google Analytics metadata.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const uri = request.params.uri;
    const match = uri.match(/^ga4:\/\/property\/([^/]+)\/metadata$/);
    
    if (!match) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid resource URI: ${uri}`
      );
    }
    
    // For now, just return a simple metadata object
    // In a full implementation, we would fetch actual metadata from the API
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            propertyId: match[1],
            availableMetrics: [
              "activeUsers",
              "sessions",
              "screenPageViews",
              "conversions",
              "totalRevenue"
            ],
            availableDimensions: [
              "date",
              "deviceCategory",
              "country",
              "browser",
              "source",
              "medium"
            ]
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    console.error("Error reading resource:", error);
    
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Error reading resource: ${(error as Error).message}`
    );
  }
});

/**
 * Start the server using stdio transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Analytics MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
