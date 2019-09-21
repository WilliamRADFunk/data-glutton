import { consts } from "../constants/constants";
import { store } from "../constants/globalStore";

export function flushStore() {
	store.IMAGES_TO_SCRAPE = [];

	store.airlinesNotFound = [];
	store.airportsNotFound = [];
    store.airportTable = {};
	store.countriesInList = [];
	store.failedAirlines = [];
	store.failedAirports = [];
	store.failedCountries = [];
	store.failedImages = [];

	store.agriculturalLands.clear();
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