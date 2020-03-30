import React, { Component, SFC, memo, Ref, forwardRef } from 'react';
import { transformComponentPropsToSchema } from '../../../../src/transformerFunctions';

interface InnerProps {
  level_1: {
    level_2: {
      level_3: string;
    };
  };
}

export interface ComponentProps {
  level_0: InnerProps;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

transformComponentPropsToSchema(FunctionComponent, { maxDepth: 2 });
