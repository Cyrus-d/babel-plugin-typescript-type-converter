import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { generateComponentPropTypes } from '../../../../src/generatorFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};
generateComponentPropTypes(FunctionComponent);
