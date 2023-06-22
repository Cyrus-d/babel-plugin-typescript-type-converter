import { NodePath, types as t } from '@babel/core';
import ts from 'typescript';
import { Config } from 'ts-to-json';

export type Path<N> = NodePath<N>;

export interface TypePropertyMap {
  [key: string]: t.TSPropertySignature[];
}

export type PropTypeDeclaration = t.TSTypeReference | t.TSIntersectionType | t.TSUnionType;

export type PropType = t.MemberExpression | t.CallExpression | t.Identifier | t.Literal;

export type TsParserConfig = Omit<
  Config,
  'path' | 'type' | 'skipTypeCheck' | 'includeProps' | 'excludeRootProps' | 'excludeProps'
>;

export interface PluginOptions extends Partial<TsParserConfig> {
  comments?: boolean;
  customPropTypeSuffixes?: string[];
  forbidExtraProps?: boolean;
  implicitChildren?: boolean;
  maxDepth?: number;
  maxSize?: number;
  strict?: boolean;
  typeCheck?: boolean | string;

  generateReactPropTypesManually?: boolean;

  disableGenerateReactPropTypesInEnv?: string[];
  disableGenerateReactPropSchemaInEnv?: string[];
  disableGenerateTypeSchemaInEnv?: string[];
  disableGenerateTypeKeysInEnv?: string[];
  /**
   * An array of glob patterns to exclude matches.
   * This is an alternative way to use negative patterns.
   *
   * @default []
   */
  ignore?: string[];

  /**
   * Lerna Working directories
   */
  workspaceDirs?: string[];

  /**
   * Since Babel does not offer a suitable method for cache invalidation for single, the following options provided:
   * None: use must update the file with transformer function manually by changing it content so babel invalidate the file cache
   * ExternalDependency: uses new `addExternalDependency` function very slow and sometime it works and sometime it doesn't
   * Comment: must reliable way, but it will add a comment to end if each file with transformer function
   */
  cacheInvalidationStrategy?: 'none' | 'externalDependency' | 'comment';

  showDebugMessages?: boolean;
}

export interface PluginOptionsInternal extends PluginOptions {
  root: string;
}

export interface ConvertState {
  airbnbPropTypes: {
    count: number;
    forbidImport: string;
    hasImport: boolean;
    namedImports: string[];
  };
  componentTypes: TypePropertyMap;
  filePath: string;
  options: Required<PluginOptions>;
  propTypes: {
    count: number;
    defaultImport: string;
    hasImport: boolean;
  };
  reactImportedName: string;
  referenceTypes: {
    [key: string]:
      | t.TSEnumDeclaration
      | t.TSEnumMember
      | t.TSInterfaceDeclaration
      | t.TSTypeAliasDeclaration;
  };
  typeChecker?: ts.TypeChecker;
  typeProgram?: ts.Program;
}
