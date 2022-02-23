export const TokenRegex = {
  NUMBER: /^[\s]*(?:-)?[0-9]+(?:\.[0-9]+)?/,
  STRING: /$./, // this regex intentionally never matches, because string matching is already handled for in the tokenizer
  BUILTIN: /^[\s]*(?:num|void|string|frac|bool|array)\s/,
  EMBEDDED: /^[\s]*<[A-Za-z_][\w]>*/,
  OPERATOR: /^[\s]*(?:[+\-\/*\=])/,
  OTHER: /^[\s]*(?:\,)/
};

export enum TokenType {
  NUMBER,
  STRING,
  BUILTIN,
  EMBEDDED,
  OPERATOR,
  OTHER
}

export function getTokenTypeName(type: TokenType) {
  const types = Object.keys(TokenType);
  return types[type + types.length / 2] as string;
}

export default class Token {
  public type: TokenType;
  public value: string;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

  public toString(): string {
    return `<${getTokenTypeName(this.type).slice(0, 2)}:${this.value}>`;
  }
}
