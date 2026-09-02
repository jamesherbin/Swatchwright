import type { AseColor } from 'ase-utils';
import type { DesignToken, TokenTree } from '../types/types.js';

export interface ExtractedPalette {
  colors: AseColor[];
  referenced: number;
  unsupported: number;
}

export function hexToRgbFloat(hex: string): [number, number, number] {
  const normalized = hex.replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new TypeError(`Unsupported color "${hex}"; expected #RRGGBB.`);
  }
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

export function extractAseColors(tokens: TokenTree): ExtractedPalette {
  const palette: ExtractedPalette = { colors: [], referenced: 0, unsupported: 0 };
  visitTree(tokens, [], palette);
  return palette;
}

export function createAseFile(tokens: TokenTree): Uint8Array<ArrayBuffer> {
  const { colors } = extractAseColors(tokens);
  if (colors.length === 0) {
    throw new Error('No direct six-digit hex color tokens were found.');
  }
  return encodeAseColors(colors);
}

/** Encode RGB swatches directly with browser-native binary APIs. */
export function encodeAseColors(colors: AseColor[]): Uint8Array<ArrayBuffer> {
  const blockSizes = colors.map((color) => 6 + getColorBlockLength(color));
  const buffer = new ArrayBuffer(12 + blockSizes.reduce((sum, size) => sum + size, 0));
  const view = new DataView(buffer);
  let offset = 0;

  offset = writeAscii(view, offset, 'ASEF');
  view.setUint16(offset, 1); offset += 2;
  view.setUint16(offset, 0); offset += 2;
  view.setUint32(offset, colors.length); offset += 4;

  for (const color of colors) {
    const blockLength = getColorBlockLength(color);
    view.setUint16(offset, 0x0001); offset += 2;
    view.setUint32(offset, blockLength); offset += 4;
    view.setUint16(offset, color.name.length + 1); offset += 2;

    for (let index = 0; index < color.name.length; index += 1) {
      view.setUint16(offset, color.name.charCodeAt(index));
      offset += 2;
    }
    view.setUint16(offset, 0); offset += 2;
    offset = writeAscii(view, offset, 'RGB ');

    for (const channel of color.color) {
      view.setFloat32(offset, channel); offset += 4;
    }

    view.setUint16(offset, colorTypeCode(color.type)); offset += 2;
  }

  return new Uint8Array(buffer);
}

function getColorBlockLength(color: AseColor): number {
  return 2 + ((color.name.length + 1) * 2) + 4 + 12 + 2;
}

function writeAscii(view: DataView, offset: number, value: string): number {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset, value.charCodeAt(index));
    offset += 1;
  }
  return offset;
}

function colorTypeCode(type: AseColor['type']): number {
  if (type === 'global') return 0;
  if (type === 'spot') return 1;
  return 2;
}

function visitTree(tree: TokenTree, path: string[], palette: ExtractedPalette): void {
  for (const [name, value] of Object.entries(tree)) {
    const currentPath = [...path, name];
    if (isDesignToken(value)) collectToken(value, currentPath, palette);
    else visitTree(value, currentPath, palette);
  }
}

function collectToken(token: DesignToken, path: string[], palette: ExtractedPalette): void {
  if (token.$type !== 'color' || typeof token.$value !== 'string') return;
  if (/^\{.+\}$/.test(token.$value)) {
    palette.referenced += 1;
    return;
  }
  if (!/^#[0-9a-f]{6}$/i.test(token.$value)) {
    palette.unsupported += 1;
    return;
  }
  palette.colors.push({
    name: path.join('.'),
    model: 'RGB',
    color: hexToRgbFloat(token.$value),
    type: 'global',
  });
}

function isDesignToken(value: DesignToken | TokenTree): value is DesignToken {
  return Object.hasOwn(value, '$value');
}
