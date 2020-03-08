import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { generateComponentPropsSchema } from '../../../../src/generatorFunctions';
import { ExternalProps } from '../typings';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}
type OwnProps = ComponentProps & ExternalProps;

const FunctionComponent = (props: OwnProps) => {
  return null;
};

const SFCComponent: SFC<OwnProps> = props => {
  return null;
};

class ClassComponent extends Component<OwnProps> {
  render() {
    return null;
  }
}

const MemoComponent: SFC<OwnProps> = memo(props => {
  return null;
});

const ForwardRefComponent: SFC<OwnProps> = forwardRef((props, ref: Ref<HTMLDivElement>) => {
  return null;
});

const MemoForwardRefComponent: SFC<OwnProps> = memo(
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
