import { GetComponentProps } from './Components';
import { TsParserConfig } from '../types';

export interface TransformerOptions<T> extends Partial<TsParserConfig> {
  excludeProps?: (keyof GetComponentProps<T>)[];
  includeProps?: (keyof GetComponentProps<T>)[];
  maxDepth?: number;
  generateInProduction?: boolean;
}
