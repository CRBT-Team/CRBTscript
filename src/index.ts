import Evaluator from './evaluator/Evaluator';
import Parser from './parser/Parser';
import Tokenizer from './token/Tokenizer';

export default function parse(code: string): string {
  const tokens = new Tokenizer(code).createTokens();
  const ast = new Parser(tokens).parse();
  return new Evaluator(ast).evaluate().value;
}

console.log(parse("<I'm dying at 3 PM + hi + house>"));
