import { Config } from 'ts-to-json';

export const getTsToJsonConfig = (
  config: Partial<Config> & Required<Pick<Config, 'path' | 'type'>>,
  onNodeParse: (node: any) => void,
): Config => {
  const { shouldParseNode, ...rest } = config;

  return {
    allowArbitraryDataTypes: true,
    expose: 'none',
    handleUnknownTypes: true,
    jsDoc: 'none',
    skipTypeCheck: true,
    topRef: true,
    ...rest,
    shouldParseNode: (node: any) => {
      onNodeParse(node);

      if (shouldParseNode) return shouldParseNode(node);

      return true;
    },
  };
};
