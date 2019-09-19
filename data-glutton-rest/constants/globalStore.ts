import * as loki from 'lokijs';

import { AirportNpmSourceObject } from '../models/airport-npm-source-object';
import { CountryReference } from '../models/country-reference';
import { Entity } from '../models/entity';
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

	public airlinesNotFound: string[] = [];
	public airportsNotFound: string[] = [];
	public airportTable: { [key: string]: AirportNpmSourceObject } = {};
	public failedAirlines: string[] = [];
	public failedAirports: string[] = [];
	public failedCountries: CountryReference[] = [];
	public failedImages: ImageScrapableObject[] = [];

	public agriculturalLands: Collection<Entity>;
	public airlines: Collection<Entity>;
	public airports: Collection<Entity>;
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
	public helicopterLandingZones: Collection<Entity>;
	public images: Collection<Entity>;
	public geographicNotes: Collection<Entity>;
	public govOffices: Collection<Entity>;
	public landUses: Collection<Entity>;
	public locations: Collection<Entity>;
	public maritimeClaims: Collection<Entity>;
	public municipalities: Collection<Entity>;
	public nationalFlags: Collection<Entity>;
	public naturalHazards: Collection<Entity>;
	public naturalResources: Collection<Entity>;
	public otherLands: Collection<Entity>;
	public permanentCropsLands: Collection<Entity>;
	public permanentPastureLands: Collection<Entity>;
	public persons: Collection<Entity>;
	public regionMaps: Collection<Entity>;
	public runways: Collection<Entity>;
	public surfaceMaterials: Collection<Entity>;
	public terrains: Collection<Entity>;

	private db: Loki;

	constructor() {
		this.db = new loki.default('loki.json');

		this.agriculturalLands = this.db.addCollection('agriculturalLands');
		this.airlines = this.db.addCollection('airlines');
		this.airports = this.db.addCollection('airports');
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
		this.govOffices = this.db.addCollection('govOffices');
		this.helicopterLandingZones = this.db.addCollection('helicopterLandingZones');
		this.landUses = this.db.addCollection('landUses');
		this.locations = this.db.addCollection('locations');
		this.maritimeClaims = this.db.addCollection('maritimeClaims');
		this.municipalities = this.db.addCollection('municipalities');
		this.nationalFlags = this.db.addCollection('nationalFlags');
		this.naturalHazards = this.db.addCollection('naturalHazards');
		this.naturalResources = this.db.addCollection('naturalResources');
		this.otherLands = this.db.addCollection('otherLands');
		this.permanentCropsLands = this.db.addCollection('permanentCropsLands');
		this.permanentPastureLands = this.db.addCollection('permanentPastureLands');
		this.persons = this.db.addCollection('persons');
		this.regionMaps = this.db.addCollection('regionMaps');
		this.runways = this.db.addCollection('runways');
		this.surfaceMaterials = this.db.addCollection('surfaceMaterials');
		this.terrains = this.db.addCollection('terrains');
	}
}

export const store = new GlobalStore();

