import { Operator } from '../token/Token';

export function getNodeTypeName(n: NodeType) {
  return Object.values(NodeType)[n];
}

export enum NodeType {
  Program,
  NumberLiteral,
  Array,
  StringLiteral,
  Boolean,
  Symbol,
  Expression,
  Operator,
  NullNode
}

export default interface INode {
  type: NodeType;
}

export interface IValueNode extends INode {
  value: any;
}

export interface ITopNode extends INode {
  body: INode[];
}

export interface ISymbolNode extends INode {
  name: string;
}

export interface IOperatorNode extends INode {
  operator: Operator;
}

export interface IExpressionNode extends INode {
  expr: INode[];
}
