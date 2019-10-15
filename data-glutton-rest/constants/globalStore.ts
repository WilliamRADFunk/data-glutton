import * as loki from 'lokijs';

import { AirportNpmSourceObject } from '../models/airport-npm-source-object';
import { CountryReference } from '../models/country-reference';
import { Entity } from '../models/entity';
import { ImageScrapableObject } from '../models/image-scrapable-object';
import { SubResourceReference } from '../models/sub-resource-reference';
import { consoleError, consoleLog } from '../utils/logger';

// const noop = () => { /* Noop */ };
const noop = (a: string, b: number) => { consoleLog(`${a} is ${Math.floor(b * 100)}% done`); };

class GlobalStore {
	public LOG_FILE_NAME: string = '';
	public LOG_STREAM: any = null;
	public IMAGES_TO_SCRAPE: ImageScrapableObject[] = [];
	public jsonLD: Array<Partial<Entity>> = [];
	public jsonNT: string = '';
	public subResourceList: SubResourceReference[] = [
		{
			name: 'Airports ~ Heliports ~ Airlines ~ Routes',
			status: 0,
			subRefs: [
				{
					name: 'GeoJson Airports',
					status: 0
				},
				{
					name: 'Npm Airports',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~1',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~2',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~3',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~4',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~5',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~6',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~7',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~8',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~9',
					status: 0
				},
				{
					name: 'DataHub Airports Source ~10',
					status: 0
				},
				{
					name: 'Airport Runways',
					status: 0
				},
				{
					name: 'Helicopter Landing Zones',
					status: 0
				},
				{
					name: 'Airlines',
					status: 0
				},
				{
					name: 'Planes',
					status: 0
				},
				{
					name: 'Routes',
					status: 0
				}
			]
		},
		{
			name: 'Seaports',
			status: 0,
			subRefs: []
		}
	];
	public countriesInList: CountryReference[] = [];
	public debugLogger: any = consoleLog;
	public errorLogger: any = consoleError;
	public progressLogger: any = noop;

	public airlinesNotFound: string[] = [];
	public airportsNotFound: string[] = [];
	public airportTable: { [key: string]: AirportNpmSourceObject } = {};
	public airportMemoTable: { [key: string]: Entity } = {};
	public routesData: string[] = [];

	public failedAirlines: string[] = [];
	public failedAirports: string[] = [];
	public failedCountries: CountryReference[] = [];
	public failedImages: ImageScrapableObject[] = [];

	public agriculturalLands: Collection<Entity>;
	public aircraftTypes: Collection<Entity>;
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
	public routes: Collection<Entity>;
	public runways: Collection<Entity>;
	public seaports: Collection<Entity>;
	public surfaceMaterials: Collection<Entity>;
	public terrains: Collection<Entity>;

	private db: Loki;

	constructor() {
		this.db = new loki.default('loki.json');

		this.agriculturalLands = this.db.addCollection('agriculturalLands');
		this.aircraftTypes = this.db.addCollection('aircraftTypes');
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
		this.routes = this.db.addCollection('routes');
		this.runways = this.db.addCollection('runways');
		this.seaports = this.db.addCollection('seaports');
		this.surfaceMaterials = this.db.addCollection('surfaceMaterials');
		this.terrains = this.db.addCollection('terrains');
	}
}

export const store = new GlobalStore();

