import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { resolveSafePath } from './utils.js';
import { writeTextFile, writeExcelFile } from './writer.js';

export class FileWriterServer {
  private server: Server;
  private rootDir: string;
  private overwrite: boolean;
  private backup: boolean;

  constructor(config: { root: string; overwrite: boolean; backup: boolean }) {
    this.rootDir = config.root;
    this.overwrite = config.overwrite;
    this.backup = config.backup;

    this.server = new Server(
      { name: 'file-writer-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'write_file',
          description: 'Append data to a file. Create it if it doesn\'t exist.',
          inputSchema: this.getToolSchema()
        },
        {
          name: 'write_file_overwrite',
          description: 'Write data to a file, COMPLETELY REPLACING it if it exists.',
          inputSchema: this.getToolSchema()
        },
        {
          name: 'write_file_backup',
          description: 'Write data to a file. If it exists, create a numbered backup (e.g., file.1.csv).',
          inputSchema: this.getToolSchema()
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { path: relPath, format, data } = request.params.arguments as any;
      const fullPath = resolveSafePath(this.rootDir, relPath);
      
      const options = {
        overwrite: request.params.name === 'write_file_overwrite',
        backup: request.params.name === 'write_file_backup'
      };

      try {
        let message: string;
        if (format === 'xlsx') {
          message = await writeExcelFile(fullPath, data, options);
        } else {
          message = await writeTextFile(fullPath, format, data, options);
        }
        return { content: [{ type: 'text', text: message }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
      }
    });
  }

  private getToolSchema() {
    return {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path to file' },
        format: { type: 'string', enum: ['txt', 'md', 'csv', 'xlsx'] },
        data: {
          type: 'object',
          properties: {
            headers: { type: 'array', items: { type: 'string' } },
            rows: { type: 'array', items: { type: 'array' } },
            content: { type: 'string' }
          }
        }
      },
      required: ['path', 'format', 'data']
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('File Writer MCP Server running on stdio');
  }
}
