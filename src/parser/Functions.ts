import Parser from './Parser';
import { TokenType } from '../token/Token';
import { NodeType, IExpressionNode } from './INode';
import { expressionWalker } from './walker/Expression';

type Delimiter = ')' | ';' | ',' | ']' | '.' | ':' | '[' | '>';

export function parseExpression(parser: Parser, ...delims: Delimiter[]): IExpressionNode {
  const expression = {
    type: NodeType.Expression,
    expr: []
  } as IExpressionNode;

  while (
    !(
      [TokenType.SPECIAL, TokenType.OTHER].includes(parser.currentToken.type) &&
      (delims as string[]).includes(parser.currentToken.value)
    )
  ) {
    expression.expr.push(expressionWalker(parser));
  }
  return expression;
}
