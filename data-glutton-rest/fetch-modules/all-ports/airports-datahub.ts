import * as fs from 'graceful-fs';
import * as path from 'path';
import rp from 'request-promise-native';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { AirportDatahubSourceObject } from '../../models/airport-datahub-source-object';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { isoCodeToDataCode } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

function makeElevation(airport: Entity, apToScrape: AirportDatahubSourceObject) {
	const objectProperties = airport.objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_ELEVATION);
	const eId = consts.ONTOLOGY.INST_ELEVATION + getUuid.default(apToScrape.ident);
	if (!map) {
		let objectProp: EntityContainer = {};
		const elevate = store.elevations.find({ '@id': { $eq: eId } })[0];
		if (elevate) {
			objectProp[consts.ONTOLOGY.HAS_ELEVATION] = elevate;
		} else {
			objectProp = entityMaker(
				consts.ONTOLOGY.HAS_ELEVATION,
				consts.ONTOLOGY.ONT_ELEVATION,
				eId,
				`Elevation for ${airport.name || apToScrape.name || apToScrape.ident}`);
				store.elevations.insert(objectProp[consts.ONTOLOGY.HAS_ELEVATION]);
		}
		map = objectProp[consts.ONTOLOGY.HAS_ELEVATION];
		airport.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_ELEVATION, objectProp));
	}
	map.datatypeProperties[consts.ONTOLOGY.DT_HIGHEST_POINT] = Number(apToScrape.elevation_ft);
	map.datatypeProperties[consts.ONTOLOGY.DT_HIGHEST_POINT_DESCRIPTION] = 'The highest point of the airport\'s useable runway system measured in feet above mean sea level';
	map.datatypeProperties[consts.ONTOLOGY.DT_UNIT] = 'ft';
}

function makeMunicipality(airport: Entity, apToScrape: AirportDatahubSourceObject, country?: Entity) {
	const objectProperties = airport.objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_MUNICIPALITY);
	const mId = consts.ONTOLOGY.INST_MUNICIPALITY + getUuid.default(apToScrape.ident);
	if (!map) {
		let objectProp: EntityContainer = {};
		const city = store.municipalities.find({ '@id': { $eq: mId } })[0];
		if (city) {
			objectProp[consts.ONTOLOGY.HAS_MUNICIPALITY] = city;
		} else {
			objectProp = entityMaker(
				consts.ONTOLOGY.HAS_MUNICIPALITY,
				consts.ONTOLOGY.ONT_MUNICIPALITY,
				mId,
				`Municipality of ${airport.municipality || apToScrape.municipality}`);
			store.municipalities.insert(objectProp[consts.ONTOLOGY.HAS_MUNICIPALITY]);
		}
		map = objectProp[consts.ONTOLOGY.HAS_MUNICIPALITY];
		map.objectProperties.push(
			entityRefMaker(
				consts.ONTOLOGY.HAS_AIRPORT,
				store.airports,
				airport['@id']
		));
		airport.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_MUNICIPALITY, objectProp));
		map.datatypeProperties[consts.ONTOLOGY.DT_NAME] = apToScrape.municipality;
		if (country) {
			country.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_MUNICIPALITY, objectProp));
			map.objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					country['@id']
			));
		}
	}
}

function parseData(airportDatahub: AirportDatahubSourceObject[], totalItems: number, partNum: number): void {
	let lastPercentageEmitted = 0;
	airportDatahub.forEach((ap: AirportDatahubSourceObject, index: number) => {
		if (lastPercentageEmitted !== Math.floor((index / totalItems) * 100)) {
			store.progressLogger(`AirportsFromDatahub Source #${partNum}`, index / totalItems);
			lastPercentageEmitted = Math.floor((index / totalItems) * 100);
		}
		const countryISO = ap.iso_country;
		let countryId = null;
		if (countryISO) {
			countryId = countryToId(isoCodeToDataCode(countryISO));
		}
		// If airport was built from previous files, only update potentially empty fields.
		const existingId = ap.iata_code && consts.ONTOLOGY.INST_AIRPORT + getUuid.default(ap.iata_code);
		const existingAirport = store.airports.find({ '@id': { $eq: existingId } })[0];
		if (ap.iata_code && existingAirport) {
			if (!existingAirport.datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] && ap.gps_code) {
				existingAirport.datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = ap.gps_code;
			}
			if (!existingAirport.datatypeProperties[consts.ONTOLOGY.DT_NAME] && ap.name) {
				existingAirport.datatypeProperties[consts.ONTOLOGY.DT_NAME] = ap.name;
			}
			if (!existingAirport.datatypeProperties[consts.ONTOLOGY.DT_REGION_ISO_CODE] && ap.iso_region) {
				existingAirport.datatypeProperties[consts.ONTOLOGY.DT_REGION_ISO_CODE] = ap.iso_region;
			}
			if (ap.elevation_ft) {
				makeElevation(existingAirport, ap);
			}
			if (ap.municipality && countryId) {
				makeMunicipality(existingAirport, ap, store.countries.find({ '@id': { $eq: countryId } })[0]);
			}
			return;
		}

		if (!ap.ident || !ap.name) {
			return; // No ident, no id. No id, no airport.
		}
		// Fetch or create airport entity
		const airportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(ap.ident);
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

		const newAirport = store.airports.find({ '@id': { $eq: airportId } })[0];
		if (ap.name) {
			newAirport.datatypeProperties[consts.ONTOLOGY.DT_NAME] = ap.name;
		}
		if (ap.gps_code) {
			newAirport.datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = ap.gps_code;
		}
		if (ap.iata_code) {
			newAirport.datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = ap.iata_code;
		}
		if (ap.iso_region) {
			newAirport.datatypeProperties[consts.ONTOLOGY.DT_REGION_ISO_CODE] = ap.iso_region;
		}

		const coords = ap.coordinates && ap.coordinates.split(',').map((c: string) => c.trim());
		let lat;
		let lng;
		if (coords && coords.length === 2) {
			lng = Number(coords[0]);
			lat = Number(coords[1]);
		}

		const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(ap.ident);
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
			newAirport.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
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

		// Extract Elevation
		if (ap.elevation_ft) {
			makeElevation(newAirport, ap);
		}

		// Associate Country...if country data was present.
		if (countryId) {
			newAirport.objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					countryId
			));
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AIRPORT, airportObjectProp));

			if (ap.type) {
				// Get relative size of airport (small, medium, large)
				if (ap.type.indexOf('_airport') > 0) {
					newAirport.datatypeProperties[consts.ONTOLOGY.DT_RELATIVE_SIZE] = ap.type.split('_')[0];
				}
				// Get status of airport (open, closed)
				if (ap.type.toLowerCase() === 'closed') {
					newAirport.datatypeProperties[consts.ONTOLOGY.DT_STATUS] = 'Closed';
				}
				// Get type of airport (heliport, military, seaplanes, closed)
				else {
					const airport = ap.type.split('_')[1];
					newAirport.datatypeProperties[consts.ONTOLOGY.DT_TYPE] = (airport && airport !== 'base') ? airport : ap.type;
				}
			}

			// Extract Municipality
			if (ap.municipality) {
				makeMunicipality(newAirport, ap, store.countries.find({ '@id': { $eq: countryId } })[0]);
			}
		}
	});
}

// Populate remaining airports from datahub list
export async function getAirportsFromDatahub(partNum: number): Promise<void> {
	let totalItems;
	return new Promise((resolve, reject) => {
	// If first in the series, fetch the live-site file
		if (partNum === 1) {
			const url = 'https://pkgstore.datahub.io/core/airport-codes/airport-codes_json/data/52caf662d370203844d4f79099da6796/airport-codes_json.json';
			rp(url, { timeout: consts.BASE.DATA_REQUEST_TIMEOUT })
				.then(results => {
					try {
						fs.writeFileSync(path.join('assets', 'airports-datahub-updated.dat'), results);
						// Populate list with live site info rather than saved file.
						const segmentedList = [];
						const airportDatahub = JSON.parse(results);
						const megaList = Object.values(airportDatahub);
						const divisor = Math.floor(megaList.length / 10);
						do {
							if (divisor > megaList.length) {
								segmentedList.push(megaList.splice(0));
							} else {
								segmentedList.push(megaList.splice(0, divisor));
							}
						} while (megaList.length);
						store.airportDatahubList = segmentedList;
						// Only grab part 1
						totalItems = store.airportDatahubList[0].length;
						parseData(store.airportDatahubList[0], totalItems, partNum);
						resolve();
					} catch(err) {
						store.errorLogger(`Filed to fetch airports from ${url}. Falling back to local copy. ${err}`);
						totalItems = Object.keys(store.airportDatahubList[partNum - 1]).length;
						parseData(store.airportDatahubList[partNum - 1], totalItems, partNum);
						resolve();
					};
				})
				.catch(err => {
					store.errorLogger(`Filed to fetch airports from ${url}. Falling back to local copy. ${err}`);
					totalItems = Object.keys(store.airportDatahubList[partNum - 1]).length;
					parseData(store.airportDatahubList[partNum - 1], totalItems, partNum);
					resolve();
				});
		
		} else {
			totalItems = Object.keys(store.airportDatahubList[partNum - 1]).length;
			parseData(store.airportDatahubList[partNum - 1], totalItems, partNum);
			resolve();
		}
	});	
}

