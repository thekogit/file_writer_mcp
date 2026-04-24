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

