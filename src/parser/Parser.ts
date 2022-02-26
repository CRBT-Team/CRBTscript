import Token, { TokenType } from '../token/Token';
import INode, { ITopNode, NodeType } from './INode';
import { expressionWalker } from './walker/Expression';
// import { defaultWalker } from "./defaultWalker";

export default class Parser {
  public tokens: Token[];
  public current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  public next(factor = 1) {
    return this.tokens[this.current + factor];
  }

  public get currentToken() {
    return this.tokens[this.current];
  }

  public walk(): INode {
    return expressionWalker(this);
  }

  public parse(): ITopNode {
    this.current = 0;
    let ast = {
      type: NodeType.Program,
      body: []
    } as ITopNode;

    while (this.current < this.tokens.length) {
      const n = this.walk();
      ast.body.push(n);
    }

    return ast;
  }
}
