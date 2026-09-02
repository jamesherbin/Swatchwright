import { describe, expect, it } from 'vitest';

import { createAseFile, extractAseColors, hexToRgbFloat } from './converter.js';

describe('hexToRgbFloat', () => {
  it('converts a six-digit hex color to normalized RGB values', () => {
    expect(hexToRgbFloat('#ff8000')).toEqual([1, 128 / 255, 0]);
  });

  it('accepts uppercase hex without a leading hash', () => {
    expect(hexToRgbFloat('00FF7F')).toEqual([0, 1, 127 / 255]);
  });
});

describe('browser ASE conversion', () => {
  const tokens = {
    palette: {
      red: { $value: '#ff0000', $type: 'color' },
      alias: { $value: '{palette.red}', $type: 'color' },
    },
  };

  it('extracts direct colors and reports skipped references', () => {
    const result = extractAseColors(tokens);
    expect(result.colors).toHaveLength(1);
    expect(result.colors[0]?.name).toBe('palette.red');
    expect(result.referenced).toBe(1);
  });

  it('creates an ASE file with the ASEF signature', () => {
    const bytes = createAseFile(tokens);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe('ASEF');

    const view = new DataView(bytes.buffer);
    expect(view.getUint16(4)).toBe(1);
    expect(view.getUint16(6)).toBe(0);
    expect(view.getUint32(8)).toBe(1);
    expect(view.getUint16(12)).toBe(0x0001);
  });
});
