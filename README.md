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
        "C:/Users/szpon/file_writer_mcp/dist/index.js",
        "--root",
        "C:/your/default/directory"
      ]
    }
  }
}
```

### Arguments

- `--root <path>`: (Required) The absolute path to the default directory for relative file operations.
- `--overwrite`: (Optional/Legacy) Provided for compatibility with older configs; ignored in favor of tool selection.
- `--backup`: (Optional/Legacy) Provided for compatibility with older configs; ignored in favor of tool selection.

## Tool Usage

The server provides three distinct tools to give you clear control over file handling directly from the LM Studio sidebar:

1. **`write_file`**: Use this for standard operations. It appends data to existing files or creates them if they do not exist.
2. **`write_file_overwrite`**: Use this to completely replace an existing file with new data.
3. **`write_file_backup`**: Use this to save data while preserving the original. If the file exists, it creates a numbered backup (e.g., `data.1.csv`).

### Tool Arguments

- `path` (string): The filename or **full absolute path**. If a relative path is provided, it resolves against the `--root` directory. If an absolute path is provided, the server writes directly to that location.
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
