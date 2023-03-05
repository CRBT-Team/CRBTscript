import chalk from 'chalk';
import Evaluator from './evaluator/Evaluator';
import Parser from './parser/Parser';
import { default as parseTokens, printTokens } from './token/Token';

const devMode = process.argv[2] === 'dev';

export default function parse(code: string, ...crbtScriptTags: [string, any][]): string {
  if (!crbtScriptTags.length) crbtScriptTags = [];
  const startingTime = Date.now();
  const tokens = parseTokens(`${code}`, ...crbtScriptTags.map(v => v[0]));
  if (devMode) console.log(chalk.grey(`Tokenized in ${Date.now() - startingTime}ms`));
  if (devMode) printTokens(tokens);
  const ast = new Parser(tokens).parse();
  if (devMode) console.log(chalk.grey(`Parsed in ${Date.now() - startingTime}ms`));
  const ret = new Evaluator(ast, ...crbtScriptTags).evaluate().value;
  if (devMode) console.log(chalk.grey(`Evaluated in ${Date.now() - startingTime}ms`));

  return ret;
}

export { default as Evaluator } from './evaluator/Evaluator';
export { default as Parser } from './parser/Parser';
export { default as tokenize } from './token/Token';

console.log(parse('{if 3 + 4 = 7} Hello {3 + 4} is seven {endif}'));
