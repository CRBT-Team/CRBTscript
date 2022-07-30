import Evaluator from './evaluator/Evaluator';
import Parser from './parser/Parser';
import Tokenizer from './token/Tokenizer';
import chalk from 'chalk';

const devMode = process.argv[2] === 'dev';

export default function parse(code: string, ...crbtScriptTags: [string, any][]): string {
  if (!crbtScriptTags.length) crbtScriptTags = [];
  const startingTime = Date.now();
  const tokens = new Tokenizer(`<${code}>`, ...crbtScriptTags.map(v => v[0])).createTokens();
  if (devMode) console.log(chalk.grey(`Tokenized in ${Date.now() - startingTime}ms`));
  if (devMode) console.log(tokens.map(v => v.toString()).join(''));
  const ast = new Parser(tokens).parse();
  if (devMode) console.log(chalk.grey(`Parsed in ${Date.now() - startingTime}ms`));
  const ret = new Evaluator(ast, ...crbtScriptTags).evaluate().value;
  if (devMode) console.log(chalk.grey(`Evaluated in ${Date.now() - startingTime}ms`));
  return ret;
}

export {default as Evaluator} from './evaluator/Evaluator';
export {default as Parser} from './parser/Parser';
export {default as Tokenizer} from './token/Tokenizer';

/*console.log(parse("I'm dying at 3 PM + <1+<user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)>+2> + hi + house + <user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)>", ['user', {
  name: 'John',
  ban: () => console.log('hi'),
  die: (a, b) => ({
    tents: {
      eat: (c) => a * b * c
    }
  })
}]));*/
