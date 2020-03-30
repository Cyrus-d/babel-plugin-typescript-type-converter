import React, { Component, SFC, memo, Ref, forwardRef } from 'react';
import { transformComponentPropsToSchema } from '../../../../src/transformerFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b: string;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

transformComponentPropsToSchema(FunctionComponent, { includeProps: ['prop_b'] });
