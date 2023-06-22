/* eslint-disable @typescript-eslint/member-ordering */
import { PluginOptions } from '../types';
import { getWorkspaceTarget } from './getWorkspaceTarget';
import { normalizeFilePath } from './normalizeFilePath';

export class FileMap<K extends string = string, V = unknown> {
  private data: Map<string, V>;

  pluginOptions: PluginOptions;

  constructor(pluginOptions: PluginOptions) {
    this.data = new Map<K, V>();
    this.pluginOptions = pluginOptions;
  }

  private normalizePath(path: string) {
    if (this.pluginOptions && this.pluginOptions.workspaceDirs) {
      return normalizeFilePath(getWorkspaceTarget(path, this.pluginOptions.workspaceDirs));
    }

    return normalizeFilePath(path);
  }

  public set(key: K, value: V) {
    this.data.set(this.normalizePath(key), value);
  }

  public get(key: K): V | undefined {
    return this.data.get(this.normalizePath(key));
  }

  public has(key: K): boolean {
    return this.data.has(this.normalizePath(key));
  }

  public delete(key: K): boolean {
    return this.data.delete(this.normalizePath(key));
  }

  public clear() {
    this.data.clear();
  }

  public entries() {
    return this.data.entries();
  }

  public keys() {
    return [...this.data.keys()];
  }

  public values(): IterableIterator<V> {
    return this.data.values();
  }

  public size(): number {
    return this.data.size;
  }
}
