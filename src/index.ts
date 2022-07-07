import Evaluator from './evaluator/Evaluator';
import Parser from './parser/Parser';
import Tokenizer from './token/Tokenizer';

export default function parse(code: string, ...crbtScriptTags: [string, any][]): string {
  const tokens = new Tokenizer(`<${code}>`, ...crbtScriptTags.map(v => v[0])).createTokens();
  console.log(tokens.map(v => v.toString()).join(''));
  const ast = new Parser(tokens).parse();
  return new Evaluator(ast, ...crbtScriptTags).evaluate().value;
}

console.log(parse("I'm dying at 3 PM + hi + house + <user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)> + h + <user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)>", ['user', {
  die: (a, b) => ({
    tents: {
      eat: (c) => a + b + c
    }
  })
}]));
