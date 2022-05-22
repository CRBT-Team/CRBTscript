import Token, { checkToken, TokenType } from '../../token/Token';
import { parseValue, parseOperator, parseSymbol } from './LowLevel';
import INode, { NodeType } from '../INode';
import { parseExpression } from '../Functions';
import Parser from '../Parser';
import { Walker } from './Walker';

export const expressionWalker: Walker = (parser: Parser): INode => {
  // get the token we're working with
  let token: Token = parser.currentToken;
  // if it's empty, we return a null node
  if (!token) return { type: NodeType.NullNode };

  // look at which type the token is and act correspondingly
  switch (token.type) {
    // a value (fallthrough)
    case TokenType.NUMBER:
    case TokenType.STRING:
      return parseValue(parser);

    // an operator
    case TokenType.OPERATOR:
      return parseOperator(parser);

    // sub-expressions and arrays
    case TokenType.SPECIAL:
      // if there's a ( expression
      if (token.value === '<') {
        parser.current++; // skip it
        const expr = parseExpression(parser, '>');
        parser.current++; // skip closing parenthesis
        return expr;
      } else {
        // if it's not then some unimplemented / incorrect syntax was used
        throw `Got unexpected ${token.toString()}.`;
      }

    // if none matched, something went wrong
    default:
      throw token.toString();
  }
};
