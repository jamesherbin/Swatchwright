export interface DesignToken {
  $value: string;
  $type?: string;
  $description?: string;
}

export type TokenTree = {
  [name: string]: DesignToken | TokenTree;
};

