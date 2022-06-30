import Token, { TokenType } from '../../token/Token';
import { parseValue, parseOperator, parseSymbol } from './LowLevel';
import INode, { NodeType } from '../INode';
import { parseDotAccess, parseExpression } from '../Functions';
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
      // if there's a ( expression or tag/dot access
      if (token.value === '<') {
        if (parser.next().check(TokenType.TAG)) {
          // if it's a tag, we parse the dot access
          return parseDotAccess(parser);
        }
        // otherwise just parse the expression
        parser.current++; // skip it
        const expr = parseExpression(parser, '>');
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
