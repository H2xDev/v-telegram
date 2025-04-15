import { EventHandler } from "./event-handler";

const DB_NAME = "vton";
const DB_VERSION = 2;

export enum DBBanks {
	PHOTOS = "photos",
	USER_PHOTOS = "userphotos",
	USER_INFO = "userinfo",
	USER_INFO_SHORT = "userinfoshort",
	CHANNELS = "channels",
	VIDEOS = "videos",
	STICKERS = "stickers",
  MUSIC = "music",
}

export interface CacheData {
	id: any,
	data: any,
	buffer?: Uint8Array,
	expiresIn?: number,
}

interface DBServiceEventsDeclaration {}

export class DBService extends EventHandler<DBServiceEventsDeclaration> {
	static instance: DBService;
	
	private blobs: Record<string | number, string> = {}
	private savePromises: Record<string, Promise<any> | null> = {};

	constructor() {
		if (DBService.instance) return DBService.instance;
		super();
		DBService.instance = this;

		indexedDB.open(DB_NAME, DB_VERSION)
			.onupgradeneeded = this.onUpgradeNeeded.bind(this);
	}

	onUpgradeNeeded(e: IDBVersionChangeEvent) {
		const db = (e.target as IDBOpenDBRequest).result;
		this.defineBank(db, DBBanks.PHOTOS);
		this.defineBank(db, DBBanks.USER_PHOTOS);
		this.defineBank(db, DBBanks.USER_INFO);
		this.defineBank(db, DBBanks.USER_INFO_SHORT);
		this.defineBank(db, DBBanks.CHANNELS);
		this.defineBank(db, DBBanks.VIDEOS);
		this.defineBank(db, DBBanks.STICKERS);
		this.defineBank(db, DBBanks.MUSIC);
	}

	private defineBank(db: IDBDatabase, bank: string) {
		if (!db.objectStoreNames.contains(bank)) {
			db.createObjectStore(bank, { keyPath: "id" });
		}
	}

	private db() {
		return new Promise<IDBDatabase>((resolve) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);

			req.onsuccess = (e: any) => {
				resolve(e.target.result);
			}

			req.onerror = (err) => {
				console.log(err);
				resolve(req.result);
			}
		});
	}

	public async save(payload: any, bank: DBBanks = DBBanks.PHOTOS, expire = 0) {
		payload.id = String(payload.id);

		if (this.savePromises[payload.id]) {
			return this.savePromises[payload.id];
		}

		if (await this.get(payload.id, bank)) {
			return this.put(payload, bank);
		}

		if (expire) {
			const expiresIn = new Date();
			expiresIn.setMinutes(expiresIn.getMinutes() + expire);
			payload.expiresIn = expiresIn.getTime();
		}

		this.savePromises[payload.id] = new Promise<void>(async resolve => {
			const req = (await this.db())
				.transaction(bank, "readwrite")
				.objectStore(bank)
				.add(payload);

			req.onsuccess = () => {
				return resolve();
			}

			req.onerror = (e) => {
				console.error(e);
				return resolve();
			}

		});

		return this.savePromises[payload.id];
	}

	public get(id: number | string, bank: DBBanks = DBBanks.PHOTOS) {
		id = String(id);

		return new Promise<CacheData | null>(async resolve => {
			try {
				const req = (await this.db())
					.transaction(bank, "readonly")
					.objectStore(bank)
					.get(id) as IDBRequest<CacheData>;

				req.onsuccess = (e: any) => {
					const res = e.target.result as CacheData;

					if (res?.expiresIn && res.expiresIn < Date.now()) {
						this.delete(id, bank);
						return resolve(null);
					}

					return resolve(res);
				}

				req.onerror = () => {
					return resolve(null);
				}
			} catch (e) {
				return resolve(null);
			}
		});
	}

	public saveBlob(id: number | string, buffer: Uint8Array, mimeType = "image/jpeg") {
		id = String(id);

		this.blobs[id] = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
	}

	public getBlob(id: number | string) {
		id = String(id);
		return this.blobs[id] || null;
	}

	private delete(id: number | string, bank: DBBanks = DBBanks.PHOTOS) {
		id = String(id);

		return new Promise<void>(async resolve => {
			const req = (await this.db())
				.transaction(bank, "readwrite")
				.objectStore(bank)
				.delete(id);
					
			req.onsuccess = () => {
				return resolve();
			}

			req.onerror = (e) => {
				console.error(e);
				return resolve();
			}
		});
	}

	private put(payload: any, bank: DBBanks = DBBanks.PHOTOS) {
		payload.id = String(payload.id);

		return new Promise<void>(async resolve => {
			const req = (await this.db())
				.transaction(bank, "readwrite")
				.objectStore(bank)
				.put(payload);

			req.onsuccess = () => {
				return resolve();
			}

			req.onerror = (e) => {
				console.error(e);
				return resolve();
			}
		});
	}
}
