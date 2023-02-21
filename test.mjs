import chalk from 'chalk';
import ora from 'ora';
import parse from './dist/index.mjs';

function expect(v) {
  return {
    v,
    toBe(v2) {
      if (v !== v2) throw new Error(`Got ${v}, should've got ${v2}`);
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

const sampleProps2 = [
  ['user', { name: 'John', money: 300 }],
  ['server', { currencyNamePlural: 'monies' }]
];

test('basic expression', () => {
  expect(parse('NO {2}', sampleProps)).toBe('NO 2');
});
test('complex expression', () => {
  expect(parse('{1 + {3 + 4} - 6 * 3}', sampleProps)).toBe('26');
});
test('long tag expression', () => {
  expect(parse('at 3 PM {1+{user.foo(3 + 4, 5).bar.baz(3 + {4 + 5})}+2} hi house {user.foo(3 + 4, 5).bar.baz(3 + {4 + 5})}',
    sampleProps)).toBe('at 3 PM 423 hi house 420');
});
test('actual real-life example', () => {
  expect(parse("{user.name} has got {user.money} {server.currencyNamePlural}, he's kinda rich!!\\nIf you double it, that'd be {{user.money} * 2}!! WOW, even richer!!!",
    ...sampleProps2)).toBe("John has got 300 monies, he's kinda rich!!\nIf you double it, that'd be 600!! WOW, even richer!!!");
});
test('escape sequences', () => {
  expect(parse("\\n\\\\n\\\\\\{hi{3+4}")).toBe("\n\\n\\{hi7");
});
