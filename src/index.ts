import Evaluator from './evaluator/Evaluator';
import Parser from './parser/Parser';
import Tokenizer from './token/Tokenizer';

export default function parse(code: string): string {
  const tokens = new Tokenizer(code).createTokens();
  console.log(tokens.map(v => v.toString()).join(''));
  const ast = new Parser(tokens).parse();
  console.log("%j", ast);
  return new Evaluator(ast).evaluate().value;
}

console.log(parse("I'm dying at 3 PM + hi + house + <user.die(3 + 4).tents.eat(3 + <4 + 5>)>"));
