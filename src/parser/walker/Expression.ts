import { Token } from 'tokenizr';
import { check } from '../../token/Token';
import { parseDotAccess, parseExpression } from '../Functions';
import INode, { IConditionalStmtNode, IExpressionNode, NodeType } from '../INode';
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

    // if statement
    // this is a bit weird because we're parsing an expression which has
    // `if <condition>} <whatever> {endif` inside, but it's probably fine
  case 'if keyword':
    if (token.value === 'if') {
      // skip the if keyword
      parser.current++;
      // get the expression after it
      const condition = parseExpression(parser, '}');

      // skip the }
      parser.current++;

      // parse until next non-expr { which should be ours for now
      const trueBranch = {
        type: NodeType.Expression,
        expr: []
      } as IExpressionNode;

      // this function is here because it's very specific to if statements
      // eslint-disable-next-line no-inner-declarations
      function conditionForIfKeyword(ifKeyword: string) {
        return !(
          (parser.canIncrement(1) ? check(parser.next(1), 'special', '{') : true) &&
            (parser.canIncrement(2) ? check(parser.next(2), 'if keyword', ifKeyword) : true)
        );
      }

      while (conditionForIfKeyword('endif')) trueBranch.expr.push(expressionWalker(parser));

      // skip the { before the next if keyword
      parser.current++;
      parser.current++;
      if (!parser.currentToken.isA('if keyword'))
        throw `somehow this isn't an if keyword, something is very wrong (found ${parser.currentToken})`;

      switch (parser.currentToken.text) {
      case 'endif':
        // skip endif
        parser.current++;
        // do NOT skip closing bracket

        return {
          type: NodeType.ConditionalStmt,
          condition,
          trueBranch
        } as IConditionalStmtNode;
      default:
        // TODO: parse elif and else clauses similarly to above
        throw `unhandled if keyword ${parser.currentToken.text}`;
      }
    } else {
      throw "we got to a non-if if keyword (shouldn't happen)";
    }

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
