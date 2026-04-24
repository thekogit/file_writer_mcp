# File Writer MCP Server

A Node.js implementation of the Model Context Protocol (MCP) designed for seamless file operations within LM Studio and other MCP-compatible environments. This server provides a robust interface for large language models to create, append, and manage files in multiple formats including Plain Text, Markdown, CSV, and Microsoft Excel (XLSX).

## Features

- **Multi-Format Support**: Handles data transformation for .txt, .md, .csv, and .xlsx files.
- **Structured Data Processing**: Accepts table data as JSON objects and converts them into the requested format automatically.
- **Flexible Write Modes**:
  - **Append (Default)**: Adds new data to the end of existing files.
  - **Overwrite**: Replaces existing files with new content.
  - **Numbered Backup**: Preserves existing data by creating incremented versions (e.g., file.1.csv).
- **Security Focused**: Restricts all file operations to a user-specified root directory to prevent unauthorized path traversal.
- **Excel Integration**: Utilizes ExcelJS for high-fidelity generation of binary spreadsheet files.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm

### Setup

1. Clone the repository or copy the source files to your local machine.
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration for LM Studio

To use this server in LM Studio, add it to your MCP settings with the following configuration:

```json
{
  "mcpServers": {
    "file-writer": {
      "command": "node",
      "args": [
        "C:/path/to/file-writer-mcp/dist/index.js",
        "--root",
        "C:/your/data/directory",
        "--backup"
      ]
    }
  }
}
```

### Arguments

- `--root <path>`: (Required) The absolute path to the directory where the server is permitted to write files.
- `--overwrite`: (Optional) If enabled, the server will overwrite existing files by default.
- `--backup`: (Optional) If enabled, the server will create numbered backups instead of appending or overwriting.

Note: `--overwrite` and `--backup` are mutually exclusive. If neither is specified, the server defaults to appending data.

## Tool Usage

### write_file

The primary tool provided by this server.

**Arguments:**
- `path` (string): The relative path and filename within the root directory.
- `format` (string): The desired file extension (`txt`, `md`, `csv`, or `xlsx`).
- `data` (object):
  - `headers` (string[]): Column names for table formats.
  - `rows` (any[][]): The dataset to be written.
  - `content` (string, optional): Plain text content for .txt files.

## Development

### Running Tests

The project uses Vitest for unit testing. To execute the test suite:
```bash
npm test
```

### Building

To compile the TypeScript source into the distribution directory:
```bash
npm run build
```

## License

This project is provided as-is for integration with LM Studio and other MCP clients.
