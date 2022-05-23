import { TokenType } from '../token/Token';
import { IDotAccessNode, IExpressionNode, IFunctionCallNode, ISymbolNode, NodeType } from './INode';
import Parser from './Parser';
import { expressionWalker } from './walker/Expression';
import { parseFunctionCall } from './walker/LowLevel';

type Delimiter = ')' | ';' | ',' | ']' | '.' | ':' | '[' | '>';

export function parseExpression(parser: Parser, ...delims: Delimiter[]): IExpressionNode {
  const expression = {
    type: NodeType.Expression,
    expr: []
  } as IExpressionNode;

  while (
    !(
      parser.currentToken.checkArr([TokenType.SPECIAL, TokenType.OTHER], delims)
    )
  ) {
    expression.expr.push(expressionWalker(parser));
  }
  return expression;
}

// no need for delims - it's always gonna be enclosed in <>
export function parseDotAccess(parser: Parser): IDotAccessNode | ISymbolNode {
  let final: IDotAccessNode = {
    type: NodeType.DotAccess
  } as IDotAccessNode;
  function snowball(node: ISymbolNode | IFunctionCallNode) {
    if (!final.accessee) {
      final.accessee = node;
    } else if (!final.prop) {
      final.prop = node;
    } else {
      const f = final;
      final.prop = node;
      final.accessee = f;
    }
  }

  parser.current ++; // firstly we skip the <

  // main loop
  while (parser.currentToken.check(TokenType.SPECIAL, '>')) {
    const curr = parser.currentToken;
    const next = parser.next();
    // because curr will always be a name, next will always be a dot, ( or >
    if (next.type !== TokenType.SPECIAL) throw `Expected token of TokenType.SPECIAL; got ${next.toString()} instead.`;
    if (next.value === '(') { // is it a function call?
      snowball(parseFunctionCall(parser) as IFunctionCallNode);
      parser.current ++; // all the other parser.current addition is implied
    } else if (['.', '>'].includes(next.value)) { // is it just a symbol?
      snowball({
        type: NodeType.Symbol,
        name: curr.value
      } as ISymbolNode);
      parser.current += 2; // skip symbol and . (or >)
    } else {
      throw `Expected '(', '.' or '>'; got ${next.toString()} instead.`;
    }
  }

  if (!final.accessee) {
    throw `Expected non-empty dot access.`; // this is an impossible case, but you never know
  }
  if (!final.prop) {
    return final.accessee; // if nothing is accessed just return the accessee. what tag does this? idk. but just in case
  }
  return final; // otherwise just be normal
}