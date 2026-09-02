import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { parseComplex, parseSimple } from './parser.js';

describe('token parsers', () => {
  it('parses tokens0.json as a flat TokenTree', () => {
    const tree = parseSimple(
      readFileSync(new URL('./tokens0.json', import.meta.url), 'utf8'),
    );

    expect(Object.keys(tree)).toHaveLength(8);
    expect(tree.white).toEqual({
      $value: '#ffffff',
      $type: 'color',
      $description: '',
    });
  });

  it('parses nested tokens and array values from tokens1.json', () => {
    const tree = parseComplex(
      readFileSync(new URL('./tokens1.json', import.meta.url), 'utf8'),
    );

    expect(tree.Typography).toMatchObject({
      'opi-cinzel': {
        $value: ['Cinzel'],
        $type: 'fontFamilies',
      },
      heading: {
        'level-one': {
          $value: '{font-size.modular.lg}',
          $type: 'fontSizes',
        },
      },
    });
  });

  it('rejects malformed token values with the token path', () => {
    expect(() =>
      parseComplex({ palette: { invalid: { $value: 42, $type: 'color' } } }),
    ).toThrow('palette.invalid');
  });
});
