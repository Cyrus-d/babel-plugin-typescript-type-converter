import { Definition } from 'ts-to-json';

declare module 'react' {
  export interface FunctionComponent {
    __propSchema?: Definition;
  }
}
