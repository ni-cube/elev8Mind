export interface IDbConfig {
  appendArray(key: string, value: string): Promise<void>;
  getArray(key: string): Promise<string[]>;
  set(key: string, value: string): Promise<void>;
  close(): Promise<void>;
  generateKey(id: string, grade: string, sex: string, prefix?: string): string;
}