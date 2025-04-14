import fs from "fs";
import { delay } from "./utils.js";
import path from "path";

class DB implements Database {
	dbPath: string;
	currentlyWriting: Set<string>;

	constructor() {
		this.dbPath = path.resolve(getDirname(), "db");
		this.currentlyWriting = new Set<string>();
	}

	/**
	 * Checks if the directory exists, creates it if not.
	 */
	private async ensureDirectoryExists(p: string): Promise<void> {
		const x = path.resolve(this.dbPath, p) as string;
		if (!fs.existsSync(x)) {
			await fs.promises.mkdir(x, { recursive: true });
		}
		return;
	}

	/**
	 * Checks if a file is currently being read.
	 */
	private allowed(p: string): boolean {
		return !this.currentlyWriting.has(p);
	}

	/* ==================================================================== */

	/**
	 * Reads a file and returns its contents.
	 */
	async read<T>(p: string): Promise<T | null> {
		const filePath = path.resolve(this.dbPath, p + ".json");
		try {
			const f = await fs.promises.readFile(filePath, { encoding: "utf-8" });
			return JSON.parse(f) as T;
		} catch (e) {
			if ((e as any).code !== "ENOENT") {
				console.error("Error reading file:", e);
				return null;
			}
			return null;
		}
	}

	/**
	 * Write data to a file, merging with existing data if needed.
	 */
	async write(p: string, data: object | string): Promise<void> {
		const filePath = path.resolve(this.dbPath, p + ".json");
		const dirPath = path.dirname(filePath);
		try {
			await this.ensureDirectoryExists(dirPath);

			while (!this.allowed(p)) {
				await delay(25);
			}

			this.currentlyWriting.add(p);

			await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
		} catch (e) {
			console.error("Error writing to file:", e);
		}

		this.currentlyWriting.delete(p);
	}

	async groupRead(f: string): Promise<Map<string, any> | undefined> {
		const folderPath = path.resolve(this.dbPath, f);
		try {
			await this.ensureDirectoryExists(folderPath);
			const files = await fs.promises.readdir(folderPath, {
				withFileTypes: true,
			});
			const arr = new Map<string, object>();
			for (const file of files) {
				if (file.isFile()) {
					const f = await fs.promises.readFile(
						path.resolve(file.parentPath, file.name),
						{ encoding: "utf-8" },
					);
					arr.set(file.name, JSON.parse(f));
				}
			}
			return arr;
		} catch (e) {
			console.error("Error reading folders in " + f, e);
			return undefined;
		}
	}
}

const db = new DB();
export default db;
