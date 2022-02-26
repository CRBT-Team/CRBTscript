import { IValueNode, NodeType } from '../../parser/INode';
import IDataClass from './IDataClass';

export default class Number implements IDataClass {
  constructor() {}

  public _add(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.NumberLiteral,
      value: number1.value + number2.value
    } as IValueNode;
  }
  public _subtract(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.NumberLiteral,
      value: number1.value - number2.value
    } as IValueNode;
  }
  public _multiply(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.NumberLiteral,
      value: number1.value * number2.value
    } as IValueNode;
  }
  public _divide(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.NumberLiteral,
      value: number1.value / number2.value
    } as IValueNode;
  }
  public _pow(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.NumberLiteral,
      value: number1.value ** number2.value
    } as IValueNode;
  }

  public _equals(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: number1.value === number2.value
    } as IValueNode;
  }
  public _equalsNot(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: number1.value !== number2.value
    } as IValueNode;
  }
  public _greater(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: number1.value > number2.value
    } as IValueNode;
  }
  public _greaterEqual(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: !this._smaller(number1, number2).value
    } as IValueNode;
  }
  public _smaller(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: number1.value < number2.value
    } as IValueNode;
  }
  public _smallerEqual(number1: IValueNode, number2: IValueNode): IValueNode {
    return {
      type: NodeType.Boolean,
      value: !this._greater(number1, number2).value
    } as IValueNode;
  }
}
