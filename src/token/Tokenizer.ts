import Token, { TokenRegex, TokenType } from './Token';

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

export default class Tokenizer {
  public code: string;
  public pos: Pos;
  public slice: string;

  constructor(code: string) {
    this.code = code;
    this.pos = new Pos(0, 0, 0, code);
    this.slice = code;
  }

  public advance(n: number) {
    this.pos.advance(n);
    this.slice = this.code.slice(this.pos.idx);
    while ([' ', '\t', ' ', '\n'].includes(this.slice[0])) this.advance(1);
    return true;
  }

  public parseSlice(isParsingString = false) {
    let token = null;
    for (let i = 0; i < Object.keys(TokenRegex).length; i++) {
      const tokenAttempt = Object.values(TokenRegex)[i].exec(this.slice);
      if (tokenAttempt === null) continue;

      token = new Token(i, tokenAttempt[0].trim());
      break;
    }

    if (token === null) {
      if (isParsingString) return new Token(TokenType.OTHER, 'no');
      const currentSlice = this.slice;
      while (this.advance(1) && !Object.values(TokenRegex).some(regex => !!regex.test(this.slice))) {}
      return new Token(TokenType.STRING, currentSlice.substring(0, currentSlice.length - this.slice.length).trim());
    }

    return token as Token;
  }

  public createTokens() {
    const tokens: Token[] = [];
    while (this.slice) {
      const token = this.parseSlice();
      tokens.push(token);
      if (token.type !== TokenType.STRING) this.advance(token.value.length);
    }
    return tokens;
  }
}
