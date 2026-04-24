#!/usr/bin/env node
import { Command } from 'commander';
import { FileWriterServer } from './server.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('file-writer-mcp')
  .description('MCP server for writing files')
  .requiredOption('--root <path>', 'Root directory for file operations')
  .option('--overwrite', 'Set default overwrite mode', false)
  .option('--backup', 'Set default backup mode', false)
  .action(async (options) => {
    const rootPath = path.resolve(options.root);
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath, { recursive: true });
    }

    const server = new FileWriterServer({
      root: rootPath,
      overwrite: options.overwrite,
      backup: options.backup
    });

    await server.run();
  });

program.parse();
