import { getAirlineOpenFlights } from './airlines-openflights';
import { getAirportsFromDatahub } from './airports-datahub';
import { getAirportsFromGeoJson } from './airports-geojson';
import { getAirportsFromNpm } from './airports-npm';
import { getPlanesOpenFlights } from './planes-openflights';
import { getRunwaysFromOurAirports } from './airports-oa-runways';
import { getHelicopterLandingZones } from './helicopter-landing-zones';
import { getRoutesOpenFlights } from './routes-openflights';

export const dataScrapers = {
	getAirlineOpenFlights,
	getAirportsFromDatahub,
	getAirportsFromGeoJson,
	getAirportsFromNpm,
	getHelicopterLandingZones,
	getPlanesOpenFlights,
	getRoutesOpenFlights,
	getRunwaysFromOurAirports
};
