import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { generateComponentPropsSchema } from '../../../../src/generatorFunctions';

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

generateComponentPropsSchema(FunctionComponent);
generateComponentPropsSchema(SFCComponent);
generateComponentPropsSchema(ClassComponent);
generateComponentPropsSchema(MemoComponent);
generateComponentPropsSchema(ForwardRefComponent);
generateComponentPropsSchema(MemoForwardRefComponent);
