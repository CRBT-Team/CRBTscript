import Token, { PositionalToken, TokenRegex, TokenType } from './Token';

export class Pos {
  constructor(public idx: number, public ln: number, public col: number, public code: string) {}

  public advance(n: number) {
    for (let i = 0; i < (n || 1); i++) {
      this.idx++;
      this.col++;
      if (this.code[this.idx] === '\n') {
        this.col = 0;
        this.ln++;
      }
    }
  }

  public clone() {
    return new Pos(this.idx, this.ln, this.col, this.code);
  }

  public toString() {
    return `${this.ln}:${this.col} (idx: ${this.idx})`;
  }
}

class Bracket {
  constructor(public start: number, public end: number, public level: number) {}
}

export default class Tokenizer {
  public code: string;
  private symbolNames: string[];
  private bracketHierarchy: Bracket[];
  private unorderedTokens: PositionalToken[];

  constructor(code: string, ...symbolNames: string[]) {
    this.code = code;
    this.symbolNames = symbolNames;
    this.bracketHierarchy = [];
    this.makeBracketHierarchy();
  }

  public makeBracketHierarchy() {
    const queue: number[] = [];
    const brackets: Bracket[] = [];
    let level = 0;
    for (let i = 0 ; i < this.code.length; i++) {
      if (this.code[i] === '<') {
        queue.push(i);
        level++;
      }
      if (this.code[i] === '>') {
        level--;
        brackets.push(new Bracket(queue.pop()!, i, level));
      }
    }
    brackets.sort((a, b) => (b.level - a.level) === 0 ? (b.start - a.start) : (b.level - a.level));
    this.bracketHierarchy = brackets;
  }

  public parseBracket(bracket: Bracket) {
    const tagRegex = new RegExp(`^[\s]*<(?:${this.symbolNames.join('|')})(?:\.[a-zA-Z0-9]+?(?:\(.*?\))?)*>`);
    const wholeBracket = this.code.slice(bracket.start, bracket.end + 1);
    let bracketContent = this.code.slice(bracket.start + 1, bracket.end);
    console.log(bracketContent);
    const regexps = Object.values(TokenRegex);
    const tokens: PositionalToken[] = [];
    tokens.push(new Token(TokenType.SPECIAL, '<').pos(bracket.start));
    if (tagRegex.exec(wholeBracket) !== null) {
      bracketContent.split('.').forEach(v => {
        // LATER
      });
      tokens.pop();
      tokens.push(new Token(TokenType.SPECIAL, '>').pos(bracket.end + 1)); 
    }
    let n = 0;
    let x = 0;
    while (bracketContent && bracket.start + x < bracket.end) {
      let m = n;
      for (let i = 0 ; i < regexps.length ; i ++) {
        const attempt = regexps[i].exec(bracketContent);
        if (attempt === null) continue;
        const result = attempt[0].trim();

        const token = new Token(i, result).pos(bracket.start + x + 1);
        tokens.push(token);
        bracketContent = bracketContent.slice(token.token.value.length);
        x += token.token.value.length;
        n++;
        break;
      }
      if (m === n) {
        const rn = this.code[bracket.start + x + 1];
        let slice = this.code.slice(bracket.start + x + 1);
        while (slice[1] && (slice = slice.slice(1)) && slice && !Object.values(TokenRegex).some(regex => !!regex.test(slice)) && slice?.length) {}
        console.log(`rn: ${rn}; slice: ${slice}`);
        const length = slice.length - rn.length;
        tokens.push(new Token(TokenType.VALUE, rn.substring(0, length)).pos(bracket.start + x));
        x += length;
      }
      while(!!/\s/g.exec(this.code[bracket.start + x + 1])) {
        x++;
      }
    }
    tokens.push(new Token(TokenType.SPECIAL, '>').pos(bracket.end + 1));
    this.unorderedTokens.push(...tokens);
  }

  public createTokens() {
    const tokens: Token[] = [];
    while (this.bracketHierarchy.length) {
      const bracket = this.bracketHierarchy.shift()!;
      this.parseBracket(bracket);
    }
    console.log(this.unorderedTokens);
    return tokens;
  }
}
