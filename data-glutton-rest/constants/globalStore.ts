import * as loki from 'lokijs';

import { CountryReference } from '../models/country-reference';
import { Entity } from '../models/entity';
import { EntityListWrapper } from '../models/entity-list-wrapper';
import { ImageScrapableObject } from '../models/image-scrapable-object';
import { consoleError, consoleLog } from '../utils/logger';

// const noop = () => { /* Noop */ };
const noop = (a: string, b: number) => { consoleLog(`${a} is ${Math.floor(b * 100)} done`); };

class GlobalStore {
	public LOG_FILE_NAME: string = '';
	public LOG_STREAM: any = null;
	public IMAGES_TO_SCRAPE: ImageScrapableObject[] = [];
	public countriesInList: CountryReference[] = [];
	public debugLogger: any = consoleLog;
	public errorLogger: any = consoleError;
	public progressLogger: any = noop;
	public failedCountries: CountryReference[] = [];
	public failedImages: ImageScrapableObject[] = [];

	public agriculturalLands: Collection<Entity>;
	public arableLands: Collection<Entity>;
	public artificiallyIrrigatedLands: Collection<Entity>;
	public borderCountries: Collection<Entity>;
	public borderMaps: Collection<Entity>;
	public borders: Collection<Entity>;
	public climates: Collection<Entity>;
	public climateZones: Collection<Entity>;
	public coasts: Collection<Entity>;
	public countries: Collection<Entity>;
	public domainAreas: Collection<Entity>;
	public elevations: Collection<Entity>;
	public forestLands: Collection<Entity>;
	public images: Collection<Entity>;
	public geographicNotes: Collection<Entity>;
	public landUses: Collection<Entity>;
	public locations: Collection<Entity>;
	public maritimeClaims: Collection<Entity>;
	public nationalFlags: Collection<Entity>;
	public naturalHazards: Collection<Entity>;
	public naturalResources: Collection<Entity>;
	public otherLands: Collection<Entity>;
	public permanentCropsLands: Collection<Entity>;
	public permanentPastureLands: Collection<Entity>;
	public regionMaps: Collection<Entity>;
	public terrains: Collection<Entity>;

	private db: Loki;

	constructor() {
		this.db = new loki.default('loki.json');

		this.agriculturalLands = this.db.addCollection('agriculturalLands');
		this.arableLands = this.db.addCollection('arableLands');
		this.artificiallyIrrigatedLands = this.db.addCollection('artificiallyIrrigatedLands');
		this.borderCountries = this.db.addCollection('borderCountries');
		this.borderMaps = this.db.addCollection('borderMaps');
		this.borders = this.db.addCollection('borders');
		this.climates = this.db.addCollection('climates');
		this.climateZones = this.db.addCollection('climateZones');
		this.coasts = this.db.addCollection('coasts');
		this.countries = this.db.addCollection('countries');
		this.domainAreas = this.db.addCollection('domainAreas');
		this.elevations = this.db.addCollection('elevations');
		this.forestLands = this.db.addCollection('forestLands');
		this.images = this.db.addCollection('images');
		this.geographicNotes = this.db.addCollection('geographicNotes');
		this.landUses = this.db.addCollection('landUses');
		this.maritimeClaims = this.db.addCollection('maritimeClaims');
		this.nationalFlags = this.db.addCollection('nationalFlags');
		this.naturalHazards = this.db.addCollection('naturalHazards');
		this.naturalResources = this.db.addCollection('naturalResources');
		this.otherLands = this.db.addCollection('otherLands');
		this.permanentCropsLands = this.db.addCollection('permanentCropsLands');
		this.permanentPastureLands = this.db.addCollection('permanentPastureLands');
		this.regionMaps = this.db.addCollection('regionMaps');
		this.terrains = this.db.addCollection('terrains');
	}

	public getObjectStore(key: string): any {
		return {} as EntityListWrapper;
	}
}

export const store = new GlobalStore();

