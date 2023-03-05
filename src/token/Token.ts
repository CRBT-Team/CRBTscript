import chalk from 'chalk';
import Tokenizr, { Token } from 'tokenizr';

export default function parse(code: string, ...tags: string[]): Token[] {
  const lexer = new Tokenizr();

  lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    if (['if', 'elif', 'else', 'endif'].includes(match[0])) ctx.accept('if keyword');
    else if (tags.includes(match[0])) ctx.accept('builtin');
    else ctx.accept('identifier');
  });

  lexer.rule(/(?:[+\-/*^]|(?:<|>)=|[!]?[=])/, ctx => {
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
  // string | Token[] is value, boolean is whether to omit operator
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
      const tokens = lexer.tokens();
      str.push(tokens);
      continue;
    }
    if (typeof str[str.length - 1] === 'string') str[str.length - 1] += code[i];
    else str.push(code[i]);
  }

  let newStr: (Token | Token[])[] = [];
  for (const item of str) {
    if (typeof item === 'string') newStr.push(new Token('string', item, item));
    else newStr.push(item.slice(0, -1));
    newStr.push(new Token('operator', '+', '+'));
  }
  newStr = newStr.slice(0, -1);

  function isArray<T>(value: T | T[]): boolean {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  function isSpecial(token: Token | Token[]): boolean {
    if (!isArray(token)) return false;
    const arr = token as Token[];
    
    return (arr.length > 1 && arr[1].isA('if keyword'));
  }

  function isOperatorPlus(token: Token | Token[]): boolean {
    if (isArray(token)) return false;
    
    return ((token as Token).isA('operator', '+'));
  }

  for (let i = 0; i < newStr.length; i++)
    if (isSpecial(newStr[i])) {
      if (i !== newStr.length - 1) if (isOperatorPlus(newStr[i + 1])) newStr.splice(i + 1, 1);
      if (i !== 0) if (isOperatorPlus(newStr[i - 1])) newStr.splice(i - 1, 1);
    }

  const retStr: Token[] = [];
  
  for (const item of newStr) 
    if (isArray(item)) retStr.push(...item as Token[]);
    else retStr.push(item as Token);
  
  return retStr;
}

type TokenType = 'number' | 'special' | 'if keyword' | 'operator' | 'identifier' | 'builtin' | 'string';

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
        case 'if keyword':
          return chalk.whiteBright;
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
