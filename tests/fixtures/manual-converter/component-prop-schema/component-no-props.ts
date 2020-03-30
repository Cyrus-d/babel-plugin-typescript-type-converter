import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { transformComponentPropsToSchema } from '../../../../src/transformerFunctions';

const FunctionComponent = props => {
  return null;
};

const SFCComponent = props => {
  return null;
};

class ClassComponent extends Component {
  render() {
    return null;
  }
}

const MemoComponent = memo(props => {
  return null;
});

const ForwardRefComponent = forwardRef((props, ref: Ref<HTMLDivElement>) => {
  return null;
});

const MemoForwardRefComponent = memo(
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
