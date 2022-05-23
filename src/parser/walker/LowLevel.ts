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
  console.log(parser.next(-1).toString(), parser.next(0).toString(), parser.next().toString());
  parser.current += 2; // skip name & (
  console.log(parser.next(-1).toString(), parser.next(0).toString(), parser.next().toString());
  const args: IExpressionNode[] = [];
  // param1, param2, ...
  while (!parser.next(0).check(TokenType.SPECIAL, ')')) { // if there are no params it's already in )
    console.log(parser.next(-1).toString(), parser.next(0).toString(), parser.next().toString());
    const param = parseExpression(parser, ')', ','); // no trailing commas >:)
    args.push(param);
    parser.current ++; // skip the special symbol
    console.log(parser.next(-1).toString(), parser.next(0).toString(), parser.next().toString());
  }
  parser.current ++; // skip )
  console.log(parser.next(-1).toString(), parser.next(0).toString(), parser.next().toString());
  console.log("Finished parsing function!");
  return {
    type: NodeType.FunctionCall,
    name: functionName,
    args
  } as IFunctionCallNode;
}
