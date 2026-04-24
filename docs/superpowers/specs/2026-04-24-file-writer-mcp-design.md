# Design Specification: File Writer MCP Server (Node.js)

**Date:** 2026-04-24
**Status:** Draft
**Topic:** A Node.js based MCP server for LM Studio that allows LLMs to create, append, or backup files in various formats (TXT, MD, CSV, XLSX) using structured JSON data.

## 1. Overview
The File Writer MCP Server provides a specialized tool for LLMs to perform file operations. It abstracts the complexity of formatting (especially for Excel) by accepting structured JSON data and converting it on-the-fly to the requested format.

## 2. Architecture & Configuration

### 2.1 Technical Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Excel Engine:** `exceljs`
- **CLI Parsing:** `commander`

### 2.2 Configuration (CLI Arguments)
The server is configured via arguments passed during startup (e.g., via the LM Studio sidebar).
- `--root <path>`: **(Required)** The absolute path to the base directory where files will be managed.
- `--overwrite`: **(Optional)** Enables overwriting existing files.
- `--backup`: **(Optional)** Enables numbered backups (e.g., `file.1.csv`) if a file exists.

*Constraint:* `--overwrite` and `--backup` are mutually exclusive. If neither is provided, the server defaults to **Append** mode.

## 3. Tool: `write_file`

### 3.1 Parameters
- `path` (string): Relative path from the root directory.
- `format` (enum: `txt`, `md`, `csv`, `xlsx`): The output file format.
- `data` (object):
    - `headers` (string[]): Column names.
    - `rows` (any[][]): Array of row data.
    - `content` (string, optional): For plain `txt` format if table structure isn't needed.

### 3.2 Logic Flow
1. **Path Resolution:** Resolves the path against the root folder. Prevents traversal outside the root.
2. **Directory Creation:** Recursively creates parent directories if they don't exist.
3. **Conflict Handling:**
    - **Append (Default):**
        - Text/CSV/MD: Appends rows. Skips headers if file exists.
        - XLSX: Loads workbook and appends to the first sheet.
    - **Overwrite:** Deletes existing file and creates fresh.
    - **Backup:** Finds the next available `filename.N.ext` and saves there.
4. **Format Conversion:**
    - **CSV:** RFC-compliant CSV generation.
    - **MD:** Pretty-printed Markdown table with aligned columns.
    - **XLSX:** Binary Excel file with bold headers.
    - **TXT:** Plain text or formatted table.

## 4. Error Handling
- **Path Traversal:** Returns an error if the path attempts to leave the root.
- **File Locks:** Returns a clear error if a file (like XLSX) is open in another program.
- **Schema Mismatch:** Pads missing row data with empty strings to maintain table alignment.

## 5. Success Criteria
- [ ] Successfully creates/appends to `.txt`, `.md`, `.csv`, and `.xlsx` files.
- [ ] Correctly handles sidebar arguments from LM Studio.
- [ ] Mutually exclusive flags prevent conflicting states.
- [ ] Numbered backups work correctly and increment automatically.
