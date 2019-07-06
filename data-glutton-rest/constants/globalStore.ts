import { openDB, deleteDB, wrap, unwrap, IDBPDatabase, IDBPObjectStore } from 'idb';

import { CountryReference } from "../models/country-reference";
import { ImageScrapableObject } from "../models/image-scrapable-object";
import { consoleError, consoleLog } from "../utils/logger"; 

// const noop = () => { /* Noop */ };
const noop = (a, b) => { consoleLog(`${a} is ${Math.floor(b * 100)} done`) };

class GlobalStore {
	private db: IDBPDatabase;
	public LOG_FILE_NAME: string = '';
	public LOG_STREAM: any = null;
	public IMAGES_TO_SCRAPE: ImageScrapableObject[] = [];
	public countriesInList: CountryReference[] = [];
	public debugLogger: any = consoleLog;
	public errorLogger: any = consoleError;
	public progressLogger: any = noop;
	public failedCountries: CountryReference[] = [];
	public failedImages: ImageScrapableObject[] = [];

	async createDB() {
		this.db = await openDB('store', 1);
		await this.db.createObjectStore('agriculturalLands');
		// db.transaction(storeName).objectStore(storeName);
		await this.db.createObjectStore('arableLands');
		await this.db.createObjectStore('artificiallyIrrigatedLands');
		await this.db.createObjectStore('borderCountries');
		await this.db.createObjectStore('borderMaps');
		await this.db.createObjectStore('borders');
		await this.db.createObjectStore('climates');
		await this.db.createObjectStore('climateZones');
		await this.db.createObjectStore('coasts');
		await this.db.createObjectStore('countries');
		await this.db.createObjectStore('domainAreas');
		await this.db.createObjectStore('elevations');
		await this.db.createObjectStore('forestLands');
		await this.db.createObjectStore('images');
		await this.db.createObjectStore('geographicNotes');
		await this.db.createObjectStore('landUses');
		await this.db.createObjectStore('locations');
		await this.db.createObjectStore('maritimeClaims');
		await this.db.createObjectStore('nationalFlags');
		await this.db.createObjectStore('naturalHazards');
		await this.db.createObjectStore('naturalResources');
		await this.db.createObjectStore('otherLands');
		await this.db.createObjectStore('permanentCropsLands');
		await this.db.createObjectStore('permanentPastureLands');
		await this.db.createObjectStore('regionMaps');
		await this.db.createObjectStore('terrains');
	}

	async deleteDB() {
		await deleteDB('store');
	}

	async addToObjectStore(storeName, value) {
		const tx = this.getTransaction(storeName);
		const _store = tx.objectStore(storeName);
		_store.put(value);
		await tx.done;
	}

	getObjectStore(storeName): IDBPObjectStore<unknown, any, string> {
		return this.db.transaction(storeName).objectStore(storeName);
	}

	getTransaction(storeName) {
		return this.db.transaction(storeName);
	}

	async wrap(wrappable) {
		return await wrap(wrappable);
	}

	async unwrap(wrapped) {
		return await unwrap(wrapped);
	}
}

export const store = new GlobalStore();

