import { deleteDB, IDBPDatabase, IDBPObjectStore, openDB, unwrap, wrap, IDBPCursorWithValue } from "idb";

import { CountryReference } from "../models/country-reference";
import { ImageScrapableObject } from "../models/image-scrapable-object";
import { consoleError, consoleLog } from "../utils/logger";
import { Entity } from "../models/entity";

// const noop = () => { /* Noop */ };
const noop = (a: string, b: number) => { consoleLog(`${a} is ${Math.floor(b * 100)} done`); };

class GlobalStore {
	public LOG_FILE_NAME: string = "";
	public LOG_STREAM: any = null;
	public IMAGES_TO_SCRAPE: ImageScrapableObject[] = [];
	public countriesInList: CountryReference[] = [];
	public debugLogger: any = consoleLog;
	public errorLogger: any = consoleError;
	public progressLogger: any = noop;
	public failedCountries: CountryReference[] = [];
	public failedImages: ImageScrapableObject[] = [];
	private db: IDBPDatabase;

	public async createDB() {
		this.db = await openDB("store", 1);
		await this.db.createObjectStore("agriculturalLands");
		// db.transaction(storeName).objectStore(storeName);
		await this.db.createObjectStore("arableLands");
		await this.db.createObjectStore("artificiallyIrrigatedLands");
		await this.db.createObjectStore("borderCountries");
		await this.db.createObjectStore("borderMaps");
		await this.db.createObjectStore("borders");
		await this.db.createObjectStore("climates");
		await this.db.createObjectStore("climateZones");
		await this.db.createObjectStore("coasts");
		await this.db.createObjectStore("countries");
		await this.db.createObjectStore("domainAreas");
		await this.db.createObjectStore("elevations");
		await this.db.createObjectStore("forestLands");
		await this.db.createObjectStore("images");
		await this.db.createObjectStore("geographicNotes");
		await this.db.createObjectStore("landUses");
		await this.db.createObjectStore("locations");
		await this.db.createObjectStore("maritimeClaims");
		await this.db.createObjectStore("nationalFlags");
		await this.db.createObjectStore("naturalHazards");
		await this.db.createObjectStore("naturalResources");
		await this.db.createObjectStore("otherLands");
		await this.db.createObjectStore("permanentCropsLands");
		await this.db.createObjectStore("permanentPastureLands");
		await this.db.createObjectStore("regionMaps");
		await this.db.createObjectStore("terrains");
	}

	public async deleteDB() {
		await deleteDB("store");
	}

	public async addToObjectStore(storeName: string, value: Entity) {
		const tx = this.getTransaction(storeName);
		const objStore = tx.objectStore(storeName);
		objStore.put(value);
		await tx.done;
	}

	public getObjectStore(storeName: string): IDBPObjectStore<unknown, any, string> {
		return this.db.transaction(storeName).objectStore(storeName);
	}

	public getTransaction(storeName: string) {
		return this.db.transaction(storeName);
	}

	public async wrap(wrappable: IDBDatabase) {
		return await wrap(wrappable);
	}

	public async unwrap(wrapped: IDBPCursorWithValue<any, any, any, any>) {
		return await unwrap(wrapped);
	}
}

export const store = new GlobalStore();

