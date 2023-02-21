import { Token } from 'tokenizr';
import { parseDotAccess, parseExpression } from '../Functions';
import INode, { NodeType } from '../INode';
import Parser from '../Parser';
import { parseOperator, parseValue } from './LowLevel';
import { Walker } from './Walker';

export const expressionWalker: Walker = (parser: Parser): INode => {
  // get the token we're working with
  const token: Token = parser.currentToken;
  // if it's empty, we return a null node
  if (!token) return { type: NodeType.NullNode };

  // look at which type the token is and act correspondingly
  switch (token.type) {
  // a value
  case 'number':
  case 'string':
    return parseValue(parser);

    // an operator
  case 'operator':
    return parseOperator(parser);

    // sub-expressions and arrays
  case 'special':
    // if there's a ( expression or tag/dot access
    if (token.value === '{') {
      if (parser.next().isA('identifier') || parser.next().isA('builtin'))
      // if it's a tag, we parse the dot access
        return parseDotAccess(parser);

      // otherwise just parse the expression
      parser.current++; // skip it
      const expr = parseExpression(parser, '}');
      parser.current++; // skip closing parenthesis

      return expr;
    } else {
      // if it's not then some unimplemented / incorrect syntax was used
      parser.logTokens();
      throw `Got unexpected ${token.toString()}.`;
    }

    // if none matched, something went wrong
  default:
    throw token.toString();
  }
};
