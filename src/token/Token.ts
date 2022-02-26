import chalk from 'chalk';

export const TokenRegex = {
  NUMBER: /^[\s]*(?:-)?[0-9]+(?:\.[0-9]+)?/,
  STRING: /$./, // this regex intentionally never matches, because string matching is already handled for in the tokenizer
  BUILTIN: /^[\s]*(?:num|void|string|frac|bool|array)\s/,
  EMBEDDED: /^[\s]*<.*>/,
  OPERATOR: /^[\s]*(?:[+\-\/*\=])/,
  OTHER: /^[\s]*(?:\,)/
};

export enum TokenType {
  NUMBER,
  STRING,
  BUILTIN,
  SPECIAL,
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

  public static colorToken(token: Token) {
    switch(token.type) {
      case TokenType.NUMBER:
        return chalk.redBright;
      case TokenType.STRING:
        return chalk.greenBright;
      case TokenType.BUILTIN:
        return chalk.yellowBright;
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
