import chalk from 'chalk';
import Tokenizr, { Token } from 'tokenizr';

export default function parse(code: string, ...tags: string[]): Token[] {
  const lexer = new Tokenizr();

  lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    if (tags.includes(match[0])) ctx.accept('builtin');
    else ctx.accept('identifier');
  });

  lexer.rule(/(?:[+\-\/*\^]|(?:<|>)=|[!]?[=])/, ctx => {
    ctx.accept('operator');
  });

  lexer.rule(/(?:{|}|\(|\)|,|\.)/, ctx => {
    ctx.accept('special');
  });

  lexer.rule(/-?[0-9][0-9_]*/, ctx => {
    ctx.accept('number');
  });

  lexer.rule(/-?(?:[0-9][0-9_]*)?\.[0-9][0-9_]*/, ctx => {
    ctx.accept('number');
  });

  lexer.rule(/[\s]+/, ctx => {
    ctx.ignore();
  });

  let escapeMode = false;
  const str: (string | Token[])[] = [];
  for (let i = 0; i < code.length; i++) {
    if (escapeMode) {
      let thingToAdd = '';
      switch (code[i]) {
      case 'n':
        thingToAdd = '\n';
        break;
      case 't':
        thingToAdd = '\t';
        break;
      case 'r':
        thingToAdd = '\r';
        break;
      case '\\':
        thingToAdd = '\\';
        break;
      case '{':
        thingToAdd = '{';
        break;
      default:
        throw code[i];
      }
      if (typeof str[str.length - 1] === 'string') str[str.length - 1] += thingToAdd;
      else str.push(thingToAdd);

      escapeMode = false;
      continue;
    }
    if (code[i] === '\\') {
      escapeMode = true;
      continue;
    }
    if (code[i] === '{') {
      let indentLevel = 1;
      let parsedThing = code[i];
      while (indentLevel !== 0) {
        parsedThing += code[++i];
        if (code[i] === '{') indentLevel++;
        if (code[i] === '}') indentLevel--;
      }
      lexer.input(parsedThing);
      str.push(lexer.tokens());
      continue;
    }
    if (typeof str[str.length - 1] === 'string') str[str.length - 1] += code[i];
    else str.push(code[i]);
  }

  const newStr: Token[] = [];
  for (const item of str) {
    if (typeof item === 'string') newStr.push(new Token('string', item, item));
    else newStr.push(...item.slice(0, -1));

    newStr.push(new Token('operator', '+', '+'));
  }

  return newStr.slice(0, -1);
}

type TokenType = 'number' | 'special' | 'operator' | 'identifier' | 'builtin' | 'string';

export function check(token: Token, tokenType: TokenType, value?: string) {
  return token.type === tokenType && (value ? token.value === value : true);
}

export function checkArr(token: Token, tokenType: TokenType[], value?: string[]) {
  return tokenType.includes(token.type as TokenType) && (value ? value.includes(token.value) : true);
}

export function printTokens(tokens: Token[]) {
  console.log(tokens
    .map(token =>
      ((token: Token) => {
        switch (token.type) {
        case 'number':
          return chalk.greenBright;
        case 'special':
          return chalk.cyanBright;
        case 'operator':
          return chalk.magentaBright;
        case 'identifier':
          return chalk.yellowBright;
        case 'builtin':
          return chalk.redBright;
        case 'string':
          return chalk.blueBright;
        }
        throw token.type;
      })(token)(token.text.trim()))
    .join(''));
}
