import ExpressionEvaluator from './ExpressionEvaluator';
import INode, { ITopNode, NodeType, IExpressionNode, IValueNode, ISymbolNode, IOperatorNode } from '../parser/INode';

export type ExprType = (INode | ExprType)[];

export default class Evaluator {
  private ast: ITopNode;

  constructor(ast: ITopNode) {
    this.ast = ast;
  }

  public evaluateExpression(n: IExpressionNode): any {
    if (!n.type) return n;
    const literalize = (v: INode): INode => {
      if (v.type === NodeType.Expression) {
        const e = (v as IExpressionNode).expr.map(literalize);
        return {
          type: NodeType.Expression,
          expr: e
        } as IExpressionNode;
      } else {
        return v as INode;
      }
    };

    const expr: IExpressionNode = {
      type: NodeType.Expression,
      expr: n.expr.map(literalize)
    };

    return ExpressionEvaluator.evaluateExpressionNode(expr);
  }

  public evaluate() {
    return this.evaluateExpression(this.ast.body[0] as IExpressionNode);
  }
}
