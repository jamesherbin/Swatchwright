
import type { DesignToken, TokenTree, TokenValue } from '../types/types.js';

type JsonObject = Record<string, unknown>;
const DOCUMENT_METADATA_KEYS = new Set(['$themes', '$metadata']);

/** Parse a flat object such as tokens0.json into a TokenTree. */
export function parseSimple(input: string | unknown): TokenTree {
  const value = parseInput(input);
  assertObject(value, 'Token document');

  const tree: TokenTree = {};

  for (const [name, candidate] of Object.entries(value)) {
    tree[name] = parseToken(candidate, name);
  }

  return tree;
}

/** Parse a recursively nested object such as tokens1.json into a TokenTree. */
export function parseComplex(input: string | unknown): TokenTree {
  const value = parseInput(input);
  assertObject(value, 'Token document');

  return parseTree(value, []);
}

function parseTree(value: JsonObject, path: string[]): TokenTree {
  const tree: TokenTree = {};

  for (const [name, candidate] of Object.entries(value)) {
    if (path.length === 0 && DOCUMENT_METADATA_KEYS.has(name)) {
      continue;
    }

    const currentPath = [...path, name];

    if (isTokenCandidate(candidate)) {
      tree[name] = parseToken(candidate, formatPath(currentPath));
      continue;
    }

    assertObject(candidate, `Token group "${formatPath(currentPath)}"`);
    tree[name] = parseTree(candidate, currentPath);
  }

  return tree;
}

function parseToken(value: unknown, path: string): DesignToken {
  assertObject(value, `Token "${path}"`);

  if (!Object.hasOwn(value, '$value')) {
    throw new TypeError(`Token "${path}" must contain a $value property.`);
  }

  const tokenValue = parseTokenValue(value.$value, path);
  const type = parseOptionalString(value.$type, '$type', path);
  const description = parseOptionalString(
    value.$description,
    '$description',
    path,
  );

  return {
    $value: tokenValue,
    ...(type === undefined ? {} : { $type: type }),
    ...(description === undefined ? {} : { $description: description }),
  };
}

function parseTokenValue(value: unknown, path: string): TokenValue {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return [...value];
  }

  throw new TypeError(
    `Token "${path}" has an unsupported $value; expected a string or string array.`,
  );
}

function parseOptionalString(
  value: unknown,
  property: string,
  path: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new TypeError(`Token "${path}" property ${property} must be a string.`);
  }

  return value;
}

function parseInput(input: string | unknown): unknown {
  if (typeof input !== 'string') {
    return input;
  }

  try {
    return JSON.parse(input) as unknown;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown JSON error';
    throw new SyntaxError(`Unable to parse token JSON: ${message}`, { cause: error });
  }
}

function assertObject(value: unknown, label: string): asserts value is JsonObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be a JSON object.`);
  }
}

function isTokenCandidate(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.hasOwn(value, '$value')
  );
}

function formatPath(path: string[]): string {
  return path.join('.');
}
