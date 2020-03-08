import { types as t } from '@babel/core';
import { Path, ConvertState, PropTypeDeclaration } from '../types';

export interface TransformerData {
  path: Path<t.FunctionDeclaration | t.VariableDeclaration> | Path<t.ClassDeclaration>;
  name: string;
  propsType?: PropTypeDeclaration;
  state: ConvertState;
}
