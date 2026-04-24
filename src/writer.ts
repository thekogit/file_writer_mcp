import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { ensureDirectory } from './utils.js';
import { toCSV, toMarkdown, TableData } from './transformers.js';

export function getNextBackupPath(filePath: string): string {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  let i = 1;
  while (fs.existsSync(`${base}.${i}${ext}`)) {
    i++;
  }
  return `${base}.${i}${ext}`;
}

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
