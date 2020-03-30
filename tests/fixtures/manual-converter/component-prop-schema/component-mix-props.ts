import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { transformComponentPropsToSchema } from '../../../../src/transformerFunctions';
import { ExternalProps } from '../typings';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps & ExternalProps) => {
  return null;
};

const SFCComponent: SFC<ComponentProps & ExternalProps> = props => {
  return null;
};

class ClassComponent extends Component<ComponentProps & ExternalProps> {
  render() {
    return null;
  }
}

const MemoComponent: SFC<ComponentProps & ExternalProps> = memo(props => {
  return null;
});

const ForwardRefComponent: SFC<ComponentProps & ExternalProps> = forwardRef(
  (props, ref: Ref<HTMLDivElement>) => {
    return null;
  },
);

const MemoForwardRefComponent: SFC<ComponentProps & ExternalProps> = memo(
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
