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
