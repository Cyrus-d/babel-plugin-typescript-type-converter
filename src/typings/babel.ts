import { ConfigAPI as BabelConfigAPI } from '@babel/core';

export interface ConfigAPI extends BabelConfigAPI {
  addExternalDependency: (path: string) => void;
}
