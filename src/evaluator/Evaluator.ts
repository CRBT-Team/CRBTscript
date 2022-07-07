import ExpressionEvaluator from './ExpressionEvaluator';
import INode, { ITopNode, NodeType, IExpressionNode, IValueNode, ISymbolNode, IOperatorNode, IDotAccessNode, IFunctionCallNode } from '../parser/INode';

export type ExprType = (INode | ExprType)[];

export default class Evaluator {
  private ast: ITopNode;
  public globals: Map<string, any>;

  constructor(ast: ITopNode, ...globals: [string, any][]) {
    this.ast = ast;
    this.globals = new Map<string, any>(globals);
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
      } else if (v.type === NodeType.DotAccess) {
        let e = v;
        const accesses: (ISymbolNode | IFunctionCallNode)[] = [];
        while (e.type === NodeType.DotAccess) {
          accesses.push((e as IDotAccessNode).prop);
          e = (e as IDotAccessNode).accessee;
        }
        accesses.reverse();
        let c = this.globals.get((e as ISymbolNode | IFunctionCallNode).name);
        let name = "";
        for (const a of accesses) {
          console.log("mu");
          if (c === undefined) {
            throw new Error(`Undefined symbol: ${name}`);
          }
          name = a.name;
          if (a.type === NodeType.Symbol) {
            c = c[name];
          } else {
            const args = (a as IFunctionCallNode).args.map(v => this.evaluateExpression(v as IExpressionNode)).map(v => v.value);
            c = c[name](...args);
          }
        }
        
        return {
          type: NodeType.StringLiteral,
          value: c
        } as IValueNode;
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
