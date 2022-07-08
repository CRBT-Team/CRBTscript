import chalk from 'chalk';

export let TokenRegex = {
  VALUE: /$./, // this regex intentionally never matches, because string matching is already handled for in the tokenizer
  TAG: /^[\s]*<(?:insert stuff here)(?:\.[a-zA-Z0-9]+?(?:\(.*?\))?)*>/, // the stuff gets inserted by the tokenizer
  EMBEDDED: /^[\s]*<.*>/,
  OPERATOR: /^[\s]*(?:[+\-\/*\^]|(?:<|>)=|[!]?[=])/,
  OTHER: /^[\s]*(?:\,)/
};

export enum TokenType {
  VALUE,
  TAG,
  SPECIAL,
  OPERATOR,
  OTHER
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

export default class Token {
  public type: TokenType;
  public value: string;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

  public static colorToken(token: Token) {
    switch (token.type) {
      case TokenType.VALUE:
        return chalk.greenBright;
      case TokenType.SPECIAL:
        return chalk.cyanBright;
      case TokenType.OPERATOR:
        return chalk.magentaBright;
      case TokenType.TAG:
        return chalk.yellowBright;
      case TokenType.OTHER:
        return chalk.blueBright;
    }
  }

  public check(type: TokenType, value?: string) {
    return (this.type === type) && (value ? (this.value === value) : true);
  }

  public checkArr(type: TokenType[], value?: string[]) {
    return type.includes(this.type) && (value ? value.includes(this.value) : true);
  }

  public toString(): string {
    return `${Token.colorToken(this)(this.value)}`;
  }
}
