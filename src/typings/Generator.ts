import { GetComponentProps } from './Components';

export interface GeneratorOptions<T> {
  excludeProps?: (keyof GetComponentProps<T>)[];
  includeProps?: (keyof GetComponentProps<T>)[];
  maxDepth?: number;
  generateInProduction?: boolean;
}
