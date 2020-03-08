import React, { Component, SFC, memo, Ref, forwardRef } from 'react';
import { generateComponentPropsSchema } from '../../../../src/generatorFunctions';

export interface ComponentProps {
  prop_a: string;
  prop_b: string;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

generateComponentPropsSchema(FunctionComponent, { excludeProps: ['prop_b'] });
