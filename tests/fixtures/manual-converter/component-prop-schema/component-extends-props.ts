import React, { Component, SFC, memo, Ref, forwardRef } from 'react';
import { transformComponentPropsToSchema } from '../../../../src/transformerFunctions';
import { ExternalProps } from '../typings';

export interface ComponentProps extends ExternalProps {
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

transformComponentPropsToSchema(FunctionComponent);
transformComponentPropsToSchema(SFCComponent);
transformComponentPropsToSchema(ClassComponent);
transformComponentPropsToSchema(MemoComponent);
transformComponentPropsToSchema(ForwardRefComponent);
transformComponentPropsToSchema(MemoForwardRefComponent);
