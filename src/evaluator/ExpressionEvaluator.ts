import {
  getNodeTypeName,
  IConditionalStmtNode,
  IExpressionNode,
  IOperatorNode,
  IValueNode,
  NodeType,
  Operator
} from '../parser/INode';

export default class ExpressionEvaluator {
  private static operatorPriorities: Operator[][] = [['^'], ['*', '/'], ['+', '-'], ['=', '<=', '>=', '!=']];
  private static possibleValueTypes: NodeType[] = [NodeType.Value, NodeType.DotAccess];

  private static evaluateSimpleOperation(value1: IValueNode,
    value2: IValueNode,
    operator: IOperatorNode,
    isNumberExpr: boolean): IValueNode {
    const exprValue1 = isNumberExpr ? parseFloat(value1.value) : value1.value;
    const exprValue2 = isNumberExpr ? parseFloat(value2.value) : value2.value;

    if (this.operatorPriorities[3].includes(operator.operator)) {
      let val: boolean;
      switch (operator.operator) {
      case '=':
        val = exprValue1 === exprValue2;
        break;
      case '!=':
        val = exprValue1 !== exprValue2;
        break;
      case '>=':
        val = exprValue1 >= exprValue2;
        break;
      case '<=':
        val = exprValue1 <= exprValue2;
        break;
      default:
        throw 'what';
      }

      return {
        type: NodeType.Value,
        value: val ? 'true' : 'false'
      } as IValueNode;
    }

    let val: string | number;
    if (!isNumberExpr && operator.operator !== '+')
      throw `The operator ${operator.operator} is not supported for strings.`;

    switch (operator.operator) {
    case '+':
      val = exprValue1 + exprValue2;
      break;
    case '-':
      val = exprValue1 - exprValue2;
      break;
    case '*':
      val = exprValue1 * exprValue2;
      break;
    case '/':
      val = exprValue1 / exprValue2;
      break;
    case '^':
      val = exprValue1 ** exprValue2;
      break;
    default:
      throw `Invalid operator: '${operator.operator}'.`;
    }

    return {
      type: NodeType.Value,
      value: val.toString()
    };
  }

  private static searchForNextOperator(operatorList: Operator[], expr: (IValueNode | IOperatorNode)[]): number | null {
    let nodeIndex = 0;

    for (const subNode of expr) {
      if (subNode.type === NodeType.Operator && operatorList.includes((subNode as IOperatorNode).operator))
        return nodeIndex;

      nodeIndex++;
    }

    return null;
  }

  public static evaluateExpressionNode(expr: IExpressionNode): IValueNode {
    const expr2: (IConditionalStmtNode | IValueNode | IOperatorNode)[] = expr.expr.map(v =>
      (v.type === NodeType.Expression
        ? this.evaluateExpressionNode(v as IExpressionNode)
        : v.type === NodeType.Operator
          ? (v as IOperatorNode)
          : v.type === NodeType.ConditionalStmt
            ? (v as IConditionalStmtNode)
            : (v as IValueNode)));
    const isNumberExpr = expr2
      .filter(v => v.type === NodeType.Value)
      .every(v => !isNaN(parseFloat((v as IValueNode).value)));

    let currentPriorityLevel = 0;

    let nextOperatorIndex: number | null;

    // TODO: evaluate if statements

    // eslint-disable-next-line no-constant-condition
    while (true) {
      nextOperatorIndex = this.searchForNextOperator(this.operatorPriorities[currentPriorityLevel], expr2 as (IValueNode | IOperatorNode)[]);
      if (nextOperatorIndex !== null) {
        if (!(nextOperatorIndex > 0 && nextOperatorIndex < expr2.length - 1))
          throw 'The operator is at an invalid position in an expression';

        const valueBefore = expr2[nextOperatorIndex - 1];
        const valueAfter = expr2[nextOperatorIndex + 1];

        for (const value of [valueBefore, valueAfter])
          if (this.possibleValueTypes.includes(value.type)) continue;
          else throw `The operator is not supported for this type of value: ${getNodeTypeName(value.type)}`;

        const result: IValueNode = this.evaluateSimpleOperation(valueBefore as IValueNode,
          valueAfter as IValueNode,
          expr.expr[nextOperatorIndex] as IOperatorNode,
          isNumberExpr);

        expr2[nextOperatorIndex - 1] = result;
        expr2.splice(nextOperatorIndex, 2);
      } else {
        if (currentPriorityLevel < this.operatorPriorities.length - 1) {
          currentPriorityLevel++;
        } else {
          if (expr2.length !== 1) {
            console.log(expr2);
            throw "There wasn't a single result while evaluating expression.";
          }

          break;
        }
      }
    }

    return expr2[0] as IValueNode;
  }
}
