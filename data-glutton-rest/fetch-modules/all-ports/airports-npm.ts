import rp from 'request-promise-native';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { AirportNpmSourceObject } from '../../models/airport-npm-source-object';
import { EntityContainer } from '../../models/entity-container';
import { airportDataList, isoCodeToDataCode } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

function parseData(airportData: AirportNpmSourceObject[], totalItems: number): void {
	let lastPercentageEmitted = 0;
	Object.values(airportData).forEach((ap: AirportNpmSourceObject, index: number) => {
		if (lastPercentageEmitted !== Math.floor((index / totalItems) * 100)) {
			store.progressLogger('AirportsFromNpm', index / totalItems);
			lastPercentageEmitted = Math.floor((index / totalItems) * 100);
		}
		if (!ap.iata) {
			return; // No IATA code, no id. No id, no airport.
		}
		// Fetch or create airport entity
		const airportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(ap.iata);
		let airportObjectProp: EntityContainer = {};
		if (!store.airports.find({ '@id': { $eq: airportId } })[0]) {
			airportObjectProp = entityMaker(
				consts.ONTOLOGY.HAS_AIRPORT,
				consts.ONTOLOGY.ONT_AIRPORT,
				airportId,
				`${ap.name || 'N/A'}`);
			store.airports.insert(airportObjectProp[consts.ONTOLOGY.HAS_AIRPORT]);
		} else {
			return; // If already in system, it already has this source's data.
		}

		if (ap.name) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NAME] = ap.name;
		}
		if (ap.iata) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = ap.iata;
		}

		const lat = ap.lat;
		const lng = ap.lon;

		if (lat && lng) {
			const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(ap.iata);
			let objectProp: EntityContainer = {};
			if (store.locations.find({ '@id': { $eq: geoId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.locations.find({ '@id': { $eq: geoId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_LOCATION,
					consts.ONTOLOGY.ONT_GEO_LOCATION,
					geoId,
					`Geographic Location for ${ap.name || 'N/A'}`);
				store.locations.insert(objectProp[consts.ONTOLOGY.HAS_LOCATION]);
				store.airports.find({ '@id': { $eq: airportId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
			}

			const locAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
			const datatypeProp: { [key: string]: string|number } = {};
			if (locAttr && locAttr.datatypeProperties) {
				locAttr.datatypeProperties[consts.WGS84_POS.LAT] = Number(lat);
				locAttr.datatypeProperties[consts.WGS84_POS.LONG] = Number(lng);
				locAttr.datatypeProperties[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
			} else {
				datatypeProp[consts.WGS84_POS.LAT] = Number(lat);
				datatypeProp[consts.WGS84_POS.LONG] = Number(lng);
				datatypeProp[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
				locAttr.datatypeProperties = datatypeProp;
			}
		}

		const countryISO = ap.iso;
		const countryId = countryToId(isoCodeToDataCode(countryISO));
		// Associate Country
		if (countryISO) {
			store.airports.find({ '@id': { $eq: airportId } })[0].objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					countryId
			));
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AIRPORT, airportObjectProp));

			// Get relative size of airport (small, medium, large)
			if (ap.size) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_RELATIVE_SIZE] = ap.size;
			}
			// Get type of airport (heliport, military, seaplanes, closed)
			if (ap.type) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_TYPE] = ap.type;
			}
			// Get status of airport (open, closed)
			if (ap.status) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_STATUS] = ap.status ? 'Open' : 'Closed';
			}
		}
	});
}

// Populate remaining airports from npm list
export async function getAirportsFromNpm(): Promise<void> {
	let totalItems;
	return new Promise((resolve, reject) => {
		const url = 'https://raw.githubusercontent.com/jbrooksuk/JSON-Airports/master/airports.json';
		rp(url, { timeout: consts.BASE.DATA_REQUEST_TIMEOUT })
			.then(results => {
				try {
					const airports = JSON.parse(results);
					totalItems = Object.keys(airports).length;
					parseData(airports, totalItems);
					resolve();
				} catch(err) {
					store.errorLogger(`Filed to fetch airports from ${url}. Falling back to local copy. ${err}`);
					totalItems = Object.keys(airportDataList).length;
					parseData(airportDataList, totalItems);
					resolve();
				};
			})
			.catch(err => {
				store.errorLogger(`Filed to fetch airports from ${url}. Falling back to local copy. ${err}`);
				totalItems = Object.keys(airportDataList).length;
				parseData(airportDataList, totalItems);
				resolve();
			});
	});
}