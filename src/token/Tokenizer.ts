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

  public parseSlice(isParsingString = false): Token | Token[] {
    for (let i = 0; i < Object.keys(TokenRegex).length; i++) {
      const tokenAttempt = Object.values(TokenRegex)[i].exec(this.slice);
      if (tokenAttempt === null) continue;

      const result = tokenAttempt[0].trim();
      if (Object.keys(TokenRegex)[i] === 'EMBEDDED') {
        const tokens = [];
        tokens.push(new Token(TokenType.SPECIAL, '<'));
        const subTokenizer = new Tokenizer(result.substring(1, result.length - 1));
        tokens.push(...subTokenizer.createTokens());
        tokens.push(new Token(TokenType.SPECIAL, '>'));
        return tokens;
      } else if (Object.keys(TokenRegex)[i] === 'TAG') {
        const tokens = [];
        let dotAccess = result.slice(1, -1); // remove the <>
        tokens.push(new Token(TokenType.SPECIAL, '<')); // but push them back
        while (dotAccess) {
          if (dotAccess[0] === '.') {
            tokens.push(new Token(TokenType.SPECIAL, '.'));
            dotAccess = dotAccess.slice(1);
            continue;
          }
          let str = '';
          while (!['.', '('].includes(dotAccess[0])) {
            if (dotAccess[0]) console.log(dotAccess[0]);
            str += dotAccess[0];
            dotAccess = dotAccess.slice(1);
          }
          tokens.push(new Token(TokenType.TAG, str));
          if (dotAccess[0] === '(') {
            let i = 0, pl = 0;
            for (; i < dotAccess.length; i++) {
              if (dotAccess[i] === '(') pl++;
              if (dotAccess[i] === ')') {
                pl--;
                if (pl === 0) break;
              }
            }
            tokens.push(new Token(TokenType.SPECIAL, '('));
            const subTokenizer = new Tokenizer(dotAccess.slice(1, i));
            dotAccess = dotAccess.slice(i + 1);
            tokens.push(...subTokenizer.createTokens());
            tokens.push(new Token(TokenType.SPECIAL, ')'));
          }
        }
        tokens.push(new Token(TokenType.SPECIAL, '>')); // (but push them back)
        return tokens;
      } else if (Object.keys(TokenRegex)[i] === 'STRING') {
        const str = tokenAttempt[0].trim();
        let num;
        if (isNaN(num = parseInt(str))) {
          return new Token(i, tokenAttempt[0].trim());
        } else {
          return new Token(TokenType.NUMBER, num);
        }
      } else return new Token(i, tokenAttempt[0].trim());
    }

    // if none matched we haven't returned therefore we have an error
    if (isParsingString) return new Token(TokenType.OTHER, 'no');
    const currentSlice = this.slice;
    while (this.advance(1) && !Object.values(TokenRegex).some(regex => !!regex.test(this.slice)) && this.slice.length) {}
    return new Token(TokenType.STRING, currentSlice.substring(0, currentSlice.length - this.slice.length).trim());
  }

  public createTokens() {
    const tokens: Token[] = [];
    while (this.slice) {
      let token = this.parseSlice();
      tokens.push(...[token].flat());
      if (!(token as Token[]).length) {
        token = token as Token;
        if (token.type !== TokenType.STRING) this.advance(token.value.length);
      } else {
        token = token as Token[];
        token.forEach(v => this.advance(v.value.length));
      }
    }
    return tokens;
  }
}
