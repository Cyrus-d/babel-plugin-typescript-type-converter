import { ComponentType, Component } from 'react';

export type GetComponentProps<T> = T extends ComponentType<infer P> | Component<infer P>
  ? P
  : never;
