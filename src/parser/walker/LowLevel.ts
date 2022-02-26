import { TokenType } from "../../token/Token";
import INode, { NodeType, ISymbolNode, IOperatorNode, IValueNode } from "../INode";
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
