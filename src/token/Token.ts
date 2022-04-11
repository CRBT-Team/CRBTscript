import chalk from 'chalk';

export const TokenRegex = {
  STRING: /$./, // this regex intentionally never matches, because string matching is already handled for in the tokenizer
  EMBEDDED: /^[\s]*<.*>/,
  OPERATOR: /^[\s]*(?:[+\-\/*\^]|(?:<|>)[=]?|[!]?[=])/,
  OTHER: /^[\s]*(?:\,)/
};

export enum TokenType {
  STRING,
  SPECIAL,
  OPERATOR,
  OTHER,
  NUMBER
}

export type Operator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '^'
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>=';

export function getTokenTypeName(type: TokenType) {
  const types = Object.keys(TokenType);
  return types[type + types.length / 2] as string;
}

export function checkToken(token: Token, type: TokenType, value?: string) {
  return token.type === type && (value ? token.value === value : true);
}

export default class Token {
  public type: TokenType;
  public value: string;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

  public static colorToken(token: Token) {
    switch (token.type) {
      case TokenType.NUMBER:
        return chalk.redBright;
      case TokenType.STRING:
        return chalk.greenBright;
      case TokenType.SPECIAL:
        return chalk.cyanBright;
      case TokenType.OPERATOR:
        return chalk.magentaBright;
      case TokenType.OTHER:
        return chalk.blueBright;
    }
  }

  public toString(): string {
    return `[${Token.colorToken(this)(this.value)}]`;
  }
}
