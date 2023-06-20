/* eslint-disable @typescript-eslint/member-ordering */
import { getFileKey } from './getFileKey';

export class FileMap<K extends string = string, V = unknown> {
  private data: Map<string, V>;

  constructor() {
    this.data = new Map<K, V>();
  }

  public set(key: K, value: V) {
    this.data.set(getFileKey(key), value);
  }

  public get(key: K): V | undefined {
    return this.data.get(getFileKey(key));
  }

  public has(key: K): boolean {
    return this.data.has(getFileKey(key));
  }

  public delete(key: K): boolean {
    return this.data.delete(getFileKey(key));
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
