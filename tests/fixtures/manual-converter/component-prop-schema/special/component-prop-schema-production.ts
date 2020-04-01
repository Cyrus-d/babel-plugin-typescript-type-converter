import React, { Component, SFC, memo, forwardRef, Ref } from 'react';
import { transformComponentPropsToSchema } from '../../../../../src/transformerFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

transformComponentPropsToSchema(FunctionComponent, { transformInProduction: true });
