import * as loki from 'lokijs';

import { CountryReference } from '../models/country-reference';
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

	public agriculturalLands: Collection<EntityListWrapper>;
	public arableLands: Collection<EntityListWrapper>;
	public artificiallyIrrigatedLands: Collection<EntityListWrapper>;
	public borderCountries: Collection<EntityListWrapper>;
	public borderMaps: Collection<EntityListWrapper>;
	public borders: Collection<EntityListWrapper>;
	public climates: Collection<EntityListWrapper>;
	public climateZones: Collection<EntityListWrapper>;
	public coasts: Collection<EntityListWrapper>;
	public countries: Collection<EntityListWrapper>;
	public domainAreas: Collection<EntityListWrapper>;
	public elevations: Collection<EntityListWrapper>;
	public forestLands: Collection<EntityListWrapper>;
	public images: Collection<EntityListWrapper>;
	public geographicNotes: Collection<EntityListWrapper>;
	public landUses: Collection<EntityListWrapper>;
	public locations: Collection<EntityListWrapper>;
	public maritimeClaims: Collection<EntityListWrapper>;
	public nationalFlags: Collection<EntityListWrapper>;
	public naturalHazards: Collection<EntityListWrapper>;
	public naturalResources: Collection<EntityListWrapper>;
	public otherLands: Collection<EntityListWrapper>;
	public permanentCropsLands: Collection<EntityListWrapper>;
	public permanentPastureLands: Collection<EntityListWrapper>;
	public regionMaps: Collection<EntityListWrapper>;
	public terrains: Collection<EntityListWrapper>;

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
		return ''
	}
}

export const store = new GlobalStore();

