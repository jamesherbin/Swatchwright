export type TokenValue = string | string[];

export interface DesignToken {
  $value: TokenValue;
  $type?: string;
  $description?: string;
}

export type TokenTree = {
  [name: string]: DesignToken | TokenTree;
};
