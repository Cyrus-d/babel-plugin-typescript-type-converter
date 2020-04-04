import { GetComponentProps } from './Components';
import { TsParserConfig } from '../types';

export interface TransformerOptions<T> extends Partial<TsParserConfig> {
  skipParsePropTypes?: (keyof GetComponentProps<T>)[];
  skipParseRootPropTypes?: (keyof GetComponentProps<T>)[];
  includeProps?: (keyof GetComponentProps<T>)[];
  maxDepth?: number;
  transformInProduction?: boolean;
}
