import { getAirportsFromDatahub } from './airports-datahub';
import { getAirportsFromGeoJson } from './airports-geojson';
import { getAirportsFromNpm } from './airports-npm';
import { getRunwaysFromOurAirports } from './airports-oa-runways';
import { getHelicopterLandingZones } from './helicopter-landing-zones';

export const dataScrapers = {
	getAirportsFromDatahub,
	getAirportsFromGeoJson,
	getAirportsFromNpm,
	getHelicopterLandingZones,
	getRunwaysFromOurAirports
};
