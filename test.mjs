import chalk from 'chalk';
import ora from 'ora';
import parse, { Tokenizer, Parser, Evaluator } from './dist/index.mjs';

function expect(v) {
  return {
    v,
    toBe(v2) {
      if (v !== v2) {
        throw new Error(`Got ${v}, should've got ${v2}`);
      }
    }
  };
}

function test(n, f) {
  const st = Date.now();
  const s = ora(`Running test ${chalk.bold(n)}...`);
  try {
    f();
  } catch (e) {
    return s.fail(chalk.redBright(`Failed test ${chalk.bold(n)}: ${chalk.grey(e.message)}`));
  }
  s.succeed(chalk.greenBright(`Passed test ${chalk.bold(n)} in ${Date.now() - st}ms`));
}

const sampleProps = [
  'user',
  {
    name: 'John',
    ban: () => console.log('hi'),
    foo: (a, b) => ({
      bar: {
        baz: c => a * b * c
      }
    })
  }
];

test('basic expression', () => {
  expect(parse('<NO + 2>', sampleProps)).toBe('3');
});
test('complex expression', () => {
  expect(parse('<1 + <3 + 4> - 6 * 3>', sampleProps)).toBe('26');
});
test('long tag expression', () => {
  expect(
    parse(
      "I'm dying at 3 PM + <1+<user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)>+2> + hi + house + <user.die(3 + 4, 5).tents.eat(3 + <4 + 5>)>",
      sampleProps
    )
  ).toBe('idk');
});
