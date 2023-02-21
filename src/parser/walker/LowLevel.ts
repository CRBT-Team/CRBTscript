import { check } from '../../token/Token';
import { parseExpression } from '../Functions';
import INode, { IExpressionNode, IFunctionCallNode, IOperatorNode, ISymbolNode, IValueNode, NodeType } from '../INode';
import Parser from '../Parser';
import { Walker } from './Walker';

export const parseSymbol: Walker = (parser: Parser): INode => {
  const token = parser.currentToken;
  parser.current++;

  return {
    type: NodeType.Symbol,
    name: token.value
  } as ISymbolNode;
};

export const parseOperator: Walker = (parser: Parser): INode => {
  const token = parser.currentToken;
  parser.current++;

  return {
    type: NodeType.Operator,
    operator: token.value
  } as IOperatorNode;
};

export const parseValue: Walker = (parser: Parser): INode => {
  const token = parser.currentToken;
  if (token.type === 'string' || token.type === 'number') {
    parser.current++;

    return {
      type: NodeType.Value,
      value: token.value
    } as IValueNode;
  }

  throw 'something is wrong with the expression parser';
};

export const parseFunctionCall: Walker = (parser: Parser): INode => {
  // name(param1, param2, ...)
  const functionName = parser.currentToken.value; // name
  parser.current += 2; // skip name & (
  const args: IExpressionNode[] = [];
  // param1, param2, ...
  // if there are no params it's already in )
  while (!check(parser.currentToken, 'special', ')')) {
    const param = parseExpression(parser, ',', ')'); // no trailing commas >:)
    args.push(param);
    if (check(parser.currentToken, 'special', ')')) break;
    parser.current++; // skip the special symbol
  }
  parser.current++; // skip )

  return {
    type: NodeType.FunctionCall,
    name: functionName,
    args
  } as IFunctionCallNode;
};
