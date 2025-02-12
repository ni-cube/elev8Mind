import { userSessions } from "@/data/store";
import { IDbConfig } from "./IDbConfig";

import fs from "fs";
import path from 'path';

class FileConfig implements IDbConfig {
  private data: typeof userSessions;
  private filePath: string;
  
  constructor(filePath: string = path.join(__dirname,"../../../../../src/data/store.ts")) {
    this.filePath = filePath;
    this.data = [...userSessions]; // Initialize with synthetic user sessions
  }

  private async saveToFile(): Promise<void> {
    try {
      const fileData = `export const userSessions = ${JSON.stringify(this.data, null, 2)};`;
      fs.writeFileSync(this.filePath, fileData);
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  }

  async appendArray(key: string, value: string) {
    const session = this.data.find((session: { user: string }) => session.user === key);
    if (session) {
      session.scores = JSON.parse(value);
    } else {
      this.data.push({
        user: key,
        scores: JSON.parse(value),
      });
    }
    await this.saveToFile();
  }

  async getArray(key: string): Promise<string[]> {
    const session = this.data.find((session: { user: string }) => session.user === key);
    return session ? [session.scores.message] : [];
  }

  async set(key: string, value: string): Promise<void> {
    const session = this.data.find((session: { user: string }) => session.user === key);
    if (session) {
      session.scores.message = value;
    } else {
      this.data.push({
        user: key,
        scores: JSON.parse(value),
      });
    }
    console.log("Store: Key=" + key + " Value=" + value);
    await this.saveToFile();
  }

  async close(): Promise<void> {
    console.log("Closing FileConfig: Data saved in file.");
    await this.saveToFile();
  }

  generateKey(id: string, grade: string, sex: string, prefix = "users"): string {
    return `${prefix}:${grade}:${sex}:${id}`;
  }
}

export default FileConfig;
