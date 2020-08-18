import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { transformTypeToPropTypes } from '../../../../src/transformerFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

transformTypeToPropTypes(FunctionComponent);
