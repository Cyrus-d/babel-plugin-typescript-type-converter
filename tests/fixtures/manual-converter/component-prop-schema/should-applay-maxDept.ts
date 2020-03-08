import React, { Component, SFC, memo, Ref, forwardRef } from 'react';
import { generateComponentPropsSchema } from '../../../../src/generatorFunctions';

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

generateComponentPropsSchema(FunctionComponent, { maxDepth: 2 });
