import { TokenType } from "../../token/Token";
import { parseExpression } from "../Functions";
import INode, { NodeType, ISymbolNode, IOperatorNode, IValueNode, IExpressionNode, IFunctionCallNode } from "../INode";
import Parser from "../Parser";
import { Walker } from "./Walker";

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
  if (token.type === TokenType.NUMBER) {
    parser.current++;
    return {
      type: NodeType.NumberLiteral,
      value: token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value)
    } as IValueNode;
  }
  if (token.type === TokenType.STRING) {
    parser.current++;
    return {
      type: NodeType.StringLiteral,
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
  while (!parser.currentToken.check(TokenType.SPECIAL, ')')) { // if there are no params it's already in )
    const param = parseExpression(parser, ',', ')'); // no trailing commas >:)
    args.push(param);
    if (parser.currentToken.check(TokenType.SPECIAL, ')')) break;
    parser.current ++; // skip the special symbol
  }
  parser.current ++; // skip )
  return {
    type: NodeType.FunctionCall,
    name: functionName,
    args
  } as IFunctionCallNode;
}
