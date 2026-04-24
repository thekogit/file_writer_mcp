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
