import { Token } from 'tokenizr';
import INode, { ITopNode, NodeType } from './INode';
import { expressionWalker } from './walker/Expression';

export default class Parser {
  public tokens: Token[];
  public current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  public logTokens() {
    console.log(this.next(-1).toString(), this.currentToken.toString(), this.next().toString());
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
    const ast = {
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
