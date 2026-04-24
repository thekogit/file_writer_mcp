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
          description: 'Write data to a file in TXT, MD, CSV, or XLSX format.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Relative path to file' },
              format: { type: 'string', enum: ['txt', 'md', 'csv', 'xlsx'] },
              overwrite: { type: 'boolean', description: 'Completely replace the file if it exists', default: false },
              backup: { type: 'boolean', description: 'Create a numbered backup (e.g. file.1.csv) if it exists', default: false },
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
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'write_file') throw new Error('Tool not found');

      const { path: relPath, format, data, overwrite, backup } = request.params.arguments as any;
      const fullPath = resolveSafePath(this.rootDir, relPath);

      // Use tool-level argument if provided, otherwise fallback to server-level config
      const finalOverwrite = overwrite !== undefined ? overwrite : this.overwrite;
      const finalBackup = backup !== undefined ? backup : this.backup;

      if (finalOverwrite && finalBackup) {
        return { content: [{ type: 'text', text: 'Error: Cannot use both overwrite and backup at the same time.' }], isError: true };
      }

      try {
        let message: string;
        const options = { overwrite: finalOverwrite, backup: finalBackup };
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('File Writer MCP Server running on stdio');
  }
}
