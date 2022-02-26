import IDataClass from './dataclasses/IDataClass';
import Number from './dataclasses/Number';
import String from './dataclasses/String';
import { getNodeTypeName, IExpressionNode, IOperatorNode, IValueNode, NodeType } from '../parser/INode';
import { Operator } from '../token/Token';

export default class ExpressionEvaluator {
  private static operatorPriorities: Operator[][] = [['^'], ['*', '/'], ['+', '-'], ['=', '<', '<=', '>', '>=', '!=']];
  private static possibleValueTypes: NodeType[] = [NodeType.Boolean, NodeType.NumberLiteral, NodeType.StringLiteral];

  private static convertBoolNodeToNumberNode(boolNode: IValueNode): IValueNode {
    boolNode.type = NodeType.NumberLiteral;
    if (boolNode.value) {
      boolNode.value = 1;
    } else {
      boolNode.value = 0;
    }
    return boolNode;
  }

  private static evaluateSimpleOperation(value1: IValueNode, value2: IValueNode, operator: IOperatorNode): IValueNode {
    if (value1.type === NodeType.Boolean) {
      value1 = this.convertBoolNodeToNumberNode(value1);
    }
    if (value2.type === NodeType.Boolean) {
      value2 = this.convertBoolNodeToNumberNode(value2);
    }

    let dataclass: IDataClass;

    switch (value1.type) {
      case NodeType.NumberLiteral:
        dataclass = new Number();
        break;
      case NodeType.StringLiteral:
        dataclass = new String();
        break;
      default:
        throw `What the hell are you trying to operate with? (given: ${getNodeTypeName(value1.type)})`;
    }

    if (this.operatorPriorities[3].includes(operator.operator)) {
      if (value1.type !== value2.type) {
        if (['==', '!='].includes(operator.operator)) {
          return {
            type: NodeType.Boolean,
            value: false
          } as IValueNode;
        }
        throw `Unsupported conditional operator for two different types: ${operator.operator}`;
      }

      switch (operator.operator) {
        case '=':
          return dataclass._equals(value1, value2);
        case '!=':
          return dataclass._equalsNot(value1, value2);
        case '>':
          return dataclass._greater(value1, value2);
        case '>=':
          return dataclass._greaterEqual(value1, value2);
        case '<':
          return dataclass._smaller(value1, value2);
        case '<=':
          return dataclass._smallerEqual(value1, value2);
        default:
          throw `Wth how is this possible`;
      }
    }

    if (!['^', '*', '/', '+', '-'].includes(operator.operator))
      throw `Cannot use assignment operators for expressions.`;

    if (value1.type !== value2.type) throw `Cannot operate on 2 values of unmergable types.`;

    switch (operator.operator) {
      case '+':
        return dataclass._add(value1, value2);
      case '-':
        return dataclass._subtract(value1, value2);
      case '*':
        return dataclass._multiply(value1, value2);
      case '/':
        return dataclass._divide(value1, value2);
      case '^':
        return dataclass._pow(value1, value2);
      default:
        throw `Invalid operator: \'${operator.operator}\'.`;
    }
  }

  private static searchForNextOperator(operatorList: Operator[], expr: IExpressionNode): number | null {
    let nodeIndex: number = 0;

    for (const subNode of expr.expr) {
      if (subNode.type === NodeType.Operator && operatorList.includes((subNode as IOperatorNode).operator)) {
        return nodeIndex;
      }
      nodeIndex++;
    }
    return null;
  }

  public static evaluateExpressionNode(expr: IExpressionNode): IValueNode {
    let currentPriorityLevel: number = 0;

    let nextOperatorIndex: number | null;

    while (true) {
      nextOperatorIndex = this.searchForNextOperator(this.operatorPriorities[currentPriorityLevel], expr);
      if (nextOperatorIndex !== null) {
        if (!(0 < nextOperatorIndex && nextOperatorIndex < expr.expr.length - 1)) {
          throw 'The operator is at an invalid position in an expression';
        }

        let valueBefore = expr.expr[nextOperatorIndex - 1];
        let valueAfter = expr.expr[nextOperatorIndex + 1];

        if (valueBefore.type === NodeType.Expression) {
          valueBefore = this.evaluateExpressionNode(valueBefore as IExpressionNode);
        }
        if (valueAfter.type === NodeType.Expression) {
          valueAfter = this.evaluateExpressionNode(valueAfter as IExpressionNode);
        }

        for (let value of [valueBefore, valueAfter]) {
          if (this.possibleValueTypes.includes(value.type)) {
            continue;
          } else {
            throw `The operator is not supported for this type of value: ${getNodeTypeName(value.type)}`;
          }
        }

        let result: IValueNode = this.evaluateSimpleOperation(
          valueBefore as IValueNode,
          valueAfter as IValueNode,
          expr.expr[nextOperatorIndex] as IOperatorNode
        );

        expr.expr[nextOperatorIndex - 1] = result;
        expr.expr.splice(nextOperatorIndex, 2);
      } else {
        if (currentPriorityLevel < this.operatorPriorities.length - 1) {
          currentPriorityLevel++;
        } else {
          if (expr.expr.length !== 1) {
            console.log(expr.expr);
            throw "There wasn't a single result while evaluating expression.";
          }

          if (expr.expr[0].type === NodeType.Expression) {
            this.evaluateExpressionNode(expr.expr[0] as IExpressionNode);
          }

          break;
        }
      }
    }
    return expr.expr[0] as IValueNode;
  }
}
