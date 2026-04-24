import path from 'path';
import fs from 'fs';

export function resolveSafePath(root: string, providedPath: string): string {
  // If the path is already absolute (e.g., C:/Users/...), use it directly
  if (path.isAbsolute(providedPath)) {
    return path.normalize(providedPath);
  }

  // Otherwise, resolve it against the root directory
  const absoluteRoot = path.resolve(root);
  const resolvedPath = path.resolve(absoluteRoot, providedPath);

  // Still prevent going "up" out of the root if a relative path was used
  if (!resolvedPath.startsWith(absoluteRoot)) {
    throw new Error(`Access denied: Relative path '${providedPath}' attempts to exit the root directory.`);
  }

  return resolvedPath;
}

export function ensureDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
