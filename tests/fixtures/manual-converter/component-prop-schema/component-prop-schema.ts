import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { generateComponentPropsSchema } from '../../../../src/generatorFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

const SFCComponent: SFC<ComponentProps> = props => {
  return null;
};

class ClassComponent extends Component<ComponentProps> {
  render() {
    return null;
  }
}

const MemoComponent: SFC<ComponentProps> = memo(props => {
  return null;
});

const ForwardRefComponent: SFC<ComponentProps> = forwardRef((props, ref: Ref<HTMLDivElement>) => {
  return null;
});

const MemoForwardRefComponent: SFC<ComponentProps> = memo(
  forwardRef((props, ref: Ref<HTMLDivElement>) => {
    return null;
  }),
);

generateComponentPropsSchema(FunctionComponent);
generateComponentPropsSchema(SFCComponent);
generateComponentPropsSchema(ClassComponent);
generateComponentPropsSchema(MemoComponent);
generateComponentPropsSchema(ForwardRefComponent);
generateComponentPropsSchema(MemoForwardRefComponent);
