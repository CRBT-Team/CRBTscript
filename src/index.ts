import Parser from './parser/Parser';
import Tokenizer from './token/Tokenizer';

const tokenizer = new Tokenizer('<Hi! How are you? != Yes + no + <he died = times of the lynx + <bye - bye>>>');
const tokens = tokenizer.createTokens();
console.log(tokens.map(v => v.toString()).join(''));

const parser = new Parser(tokens);
const ast = parser.parse();
console.log('%j', ast);
