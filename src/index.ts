import Tokenizer from './token/Tokenizer';

const tokenizer = new Tokenizer('Hi! How are you? = Yes + no <hi>');
const tokens = tokenizer.createTokens();

console.log(tokens.map(v => v.toString()).join(''));