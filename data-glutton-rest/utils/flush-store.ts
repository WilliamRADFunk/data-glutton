import { consts } from "../constants/constants";
import { store } from "../constants/globalStore";

export function flushStore() {
	store.IMAGES_TO_SCRAPE = [];

	store.airlinesNotFound = [];
	store.airportsNotFound = [];
	store.airportTable = {};
	store.subResourceList = [
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
			status: 0
		}
	];
	store.countriesInList = [];
	store.failedAirlines = [];
	store.failedAirports = [];
	store.failedCountries = [];
	store.failedImages = [];

	store.agriculturalLands.clear();
	store.aircraftTypes.clear();
	store.airlines.clear();
	store.airports.clear();
	store.arableLands.clear();
	store.artificiallyIrrigatedLands.clear();
	store.borderCountries.clear();
	store.borderMaps.clear();
	store.borders.clear();
	store.climates.clear();
	store.climateZones.clear();
	store.coasts.clear();
	store.domainAreas.clear();
	store.elevations.clear();
	store.forestLands.clear();
	store.helicopterLandingZones.clear();
	store.images.clear();
	store.geographicNotes.clear();
	store.govOffices.clear();
	store.landUses.clear();
	store.locations.clear();
	store.maritimeClaims.clear();
	store.municipalities.clear();
	store.nationalFlags.clear();
	store.naturalHazards.clear();
	store.naturalResources.clear();
	store.otherLands.clear();
	store.permanentCropsLands.clear();
	store.permanentPastureLands.clear();
	store.persons.clear();
	store.regionMaps.clear();
	store.routes.clear();
	store.runways.clear();
	store.surfaceMaterials.clear();
    store.terrains.clear();

	store.countries.mapReduce(country => {
        country.objectProperties.length = 0;
        const datatypeProperties: { [key: string]: string|number } = {};
        datatypeProperties[consts.ONTOLOGY.DT_GEC_CODE] = country.dataCode;
        datatypeProperties[consts.ONTOLOGY.DT_ISO_CODE] = country.isoCode;
        country.datatypeProperties = datatypeProperties;
    },
    country => country);
};