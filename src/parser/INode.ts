export function getNodeTypeName(n: NodeType) {
  return Object.values(NodeType)[n];
}

export type Operator = '+' | '-' | '*' | '/' | '^' | '=' | '!=' | '<' | '>' | '<=' | '>=';

export enum NodeType {
  Program,
  Array,
  Value,
  Symbol,
  Expression,
  Operator,
  FunctionCall,
  DotAccess,
  ConditionalStmt,
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

export interface IFunctionCallNode extends INode {
  name: string;
  args: INode[];
}

export interface IDotAccessNode extends INode {
  accessee: ISymbolNode | IFunctionCallNode | IDotAccessNode;
  prop: ISymbolNode | IFunctionCallNode;
}

export interface IConditionalStmtNode extends INode {
  condition: IExpressionNode;
  trueBranch: IExpressionNode;
  elseBranch?: IConditionalStmtNode | IExpressionNode;
}
