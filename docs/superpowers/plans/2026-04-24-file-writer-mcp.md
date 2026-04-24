# File Writer MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js MCP server that allows LLMs to write files in TXT, MD, CSV, and XLSX formats with configurable overwrite/backup/append logic.

**Architecture:** A TypeScript-based MCP server using `@modelcontextprotocol/sdk` and `exceljs`. It uses `commander` for sidebar argument parsing and a modular structure to separate protocol logic from file writing and format transformation.

**Tech Stack:** Node.js, TypeScript, `@modelcontextprotocol/sdk`, `exceljs`, `commander`, `vitest` (for testing).

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "file-writer-mcp",
  "version": "1.0.0",
  "description": "MCP server for writing files in various formats",
  "type": "module",
  "bin": {
    "file-writer-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0",
    "commander": "^12.0.0",
    "exceljs": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "typescript": "^5.4.5",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: `node_modules` and `package-lock.json` created.

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json package-lock.json
git commit -m "chore: initialize project"
```

---

### Task 2: Utility Functions (Path & Directory)

**Files:**
- Create: `src/utils.ts`
- Create: `src/__tests__/utils.test.ts`

- [ ] **Step 1: Write failing test for path validation**

```typescript
import { describe, it, expect } from 'vitest';
import { resolveSafePath } from '../utils.js';
import path from 'path';

describe('resolveSafePath', () => {
  it('should resolve a safe path within root', () => {
    const root = 'C:/data';
    const relative = 'test.txt';
    const result = resolveSafePath(root, relative);
    expect(result).toBe(path.join(root, relative));
  });

  it('should throw error for path traversal', () => {
    const root = 'C:/data';
    const relative = '../outside.txt';
    expect(() => resolveSafePath(root, relative)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (file not found)

- [ ] **Step 3: Implement resolveSafePath**

```typescript
import path from 'path';
import fs from 'fs';

export function resolveSafePath(root: string, relativePath: string): string {
  const absoluteRoot = path.resolve(root);
  const resolvedPath = path.resolve(absoluteRoot, relativePath);

  if (!resolvedPath.startsWith(absoluteRoot)) {
    throw new Error(`Access denied: Path '${relativePath}' is outside the root directory.`);
  }

  return resolvedPath;
}

export function ensureDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils.ts src/__tests__/utils.test.ts
git commit -m "feat: add path validation and directory helpers"
```

---

### Task 3: Transformers (JSON to MD/CSV)

**Files:**
- Create: `src/transformers.ts`
- Create: `src/__tests__/transformers.test.ts`

- [ ] **Step 1: Write failing test for CSV and MD transformation**

```typescript
import { describe, it, expect } from 'vitest';
import { toCSV, toMarkdown } from '../transformers.js';

describe('transformers', () => {
  const data = {
    headers: ['Name', 'Age'],
    rows: [['Alice', 30], ['Bob', 25]]
  };

  it('should convert to CSV', () => {
    const csv = toCSV(data);
    expect(csv).toBe('Name,Age\nAlice,30\nBob,25');
  });

  it('should convert to Markdown', () => {
    const md = toMarkdown(data);
    expect(md).toContain('| Name | Age |');
    expect(md).toContain('| Alice | 30 |');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL

- [ ] **Step 3: Implement transformers**

```typescript
export interface TableData {
  headers: string[];
  rows: any[][];
}

export function toCSV(data: TableData, includeHeaders = true): string {
  const escape = (val: any) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = data.rows.map(row => row.map(escape).join(','));
  if (includeHeaders) {
    const headers = data.headers.map(escape).join(',');
    return [headers, ...rows].join('\n');
  }
  return rows.join('\n');
}

export function toMarkdown(data: TableData): string {
  const headers = `| ${data.headers.join(' | ')} |`;
  const separator = `| ${data.headers.map(() => '---').join(' | ')} |`;
  const rows = data.rows.map(row => `| ${row.join(' | ')} |`).join('\n');
  return [headers, separator, rows].join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/transformers.ts src/__tests__/transformers.test.ts
git commit -m "feat: add CSV and Markdown transformers"
```

---

### Task 4: File Writer Core (Append, Overwrite, Backup)

**Files:**
- Create: `src/writer.ts`

- [ ] **Step 1: Implement getNextBackupPath helper**

```typescript
import fs from 'fs';
import path from 'path';

export function getNextBackupPath(filePath: string): string {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  let i = 1;
  while (fs.existsSync(`${base}.${i}${ext}`)) {
    i++;
  }
  return `${base}.${i}${ext}`;
}
```

- [ ] **Step 2: Implement writeTextFile (MD, CSV, TXT)**

```typescript
import { ensureDirectory } from './utils.js';
import { toCSV, toMarkdown, TableData } from './transformers.js';

export async function writeTextFile(
  filePath: string,
  format: string,
  data: TableData | string,
  options: { overwrite?: boolean; backup?: boolean }
): Promise<string> {
  let targetPath = filePath;
  let isAppend = !options.overwrite && !options.backup;

  if (options.backup && fs.existsSync(filePath)) {
    targetPath = getNextBackupPath(filePath);
    isAppend = false;
  }

  ensureDirectory(targetPath);

  let content = '';
  if (typeof data === 'string') {
    content = data;
  } else {
    if (format === 'csv') {
      const exists = fs.existsSync(targetPath) && isAppend;
      content = toCSV(data, !exists);
    } else if (format === 'md') {
      content = toMarkdown(data);
    } else {
      content = JSON.stringify(data, null, 2);
    }
  }

  if (isAppend && fs.existsSync(targetPath)) {
    fs.appendFileSync(targetPath, '\n' + content);
    return `Appended to ${targetPath}`;
  } else {
    fs.writeFileSync(targetPath, content);
    return `Saved to ${targetPath}`;
  }
}
```

- [ ] **Step 3: Implement writeExcelFile**

```typescript
import ExcelJS from 'exceljs';

export async function writeExcelFile(
  filePath: string,
  data: TableData,
  options: { overwrite?: boolean; backup?: boolean }
): Promise<string> {
  let targetPath = filePath;
  let isAppend = !options.overwrite && !options.backup;

  if (options.backup && fs.existsSync(filePath)) {
    targetPath = getNextBackupPath(filePath);
    isAppend = false;
  }

  ensureDirectory(targetPath);

  const workbook = new ExcelJS.Workbook();
  let worksheet: ExcelJS.Worksheet;

  if (isAppend && fs.existsSync(targetPath)) {
    await workbook.xlsx.readFile(targetPath);
    worksheet = workbook.getWorksheet(1) || workbook.addWorksheet('Sheet1');
  } else {
    worksheet = workbook.addWorksheet('Sheet1');
    const headerRow = worksheet.addRow(data.headers);
    headerRow.font = { bold: true };
  }

  data.rows.forEach(row => worksheet.addRow(row));
  await workbook.xlsx.writeFile(targetPath);

  return isAppend ? `Appended to Excel ${targetPath}` : `Saved Excel to ${targetPath}`;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/writer.ts
git commit -m "feat: implement text and excel writing logic"
```

---

### Task 5: MCP Server & Tool Registration

**Files:**
- Create: `src/server.ts`

- [ ] **Step 1: Implement Server class**

```typescript
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
              data: {
                type: 'object',
                properties: {
                  headers: { type: 'array', items: { type: 'string' } },
                  rows: { type: 'array', items: { type: 'array' } },
                  content: { type: 'string' }
                },
                required: ['headers', 'rows']
              }
            },
            required: ['path', 'format', 'data']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'write_file') throw new Error('Tool not found');

      const { path: relPath, format, data } = request.params.arguments as any;
      const fullPath = resolveSafePath(this.rootDir, relPath);

      try {
        let message: string;
        if (format === 'xlsx') {
          message = await writeExcelFile(fullPath, data, { overwrite: this.overwrite, backup: this.backup });
        } else {
          message = await writeTextFile(fullPath, format, data, { overwrite: this.overwrite, backup: this.backup });
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
```

- [ ] **Step 2: Commit**

```bash
git add src/server.ts
git commit -m "feat: register write_file tool in MCP server"
```

---

### Task 6: Entry Point & CLI Arguments

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Implement index.ts with commander**

```typescript
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
  .option('--overwrite', 'Overwrite existing files', false)
  .option('--backup', 'Create numbered backups of existing files', false)
  .action(async (options) => {
    if (options.overwrite && options.backup) {
      console.error('Error: --overwrite and --backup are mutually exclusive.');
      process.exit(1);
    }

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
```

- [ ] **Step 2: Build the project**

Run: `npm run build`
Expected: `dist/` directory created with compiled files.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add entry point with CLI argument parsing"
```

---

### Task 7: Final Validation

- [ ] **Step 1: Create a manual test script**

Create `test-run.js`:
```javascript
import { spawn } from 'child_process';

const child = spawn('node', ['./dist/index.js', '--root', './test-output', '--backup'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

console.log('Server started. Test it via an MCP client or manual tool call injection.');
// Since we can't easily pipe MCP JSON-RPC manually here without a client, 
// we will rely on unit tests and a build check.
```

- [ ] **Step 2: Verify build and exit**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 3: Final Commit**

```bash
git add .
git commit -m "chore: final project structure"
```

```