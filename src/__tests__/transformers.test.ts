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
