import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { AirportProperties } from '../../models/airport-properties';
import { EntityContainer } from '../../models/entity-container';
import { GeoFeature } from '../../models/geofeature';
import { airportDataLocal, isoCodeToDataCode } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

export function getAirportsFromGeoJson() {
	Object.values(airportDataLocal.features).forEach((ap: GeoFeature) => {
		const airportProps: AirportProperties = ap.properties as AirportProperties;
		const airportName = airportProps.name && airportProps.name.replace('Int\'l', 'International');
		const airportLocation = ap.geometry.coordinates;

		 // No IATA code, no id. No id, no airport.
		if (!airportProps.iata_code) {
			return;
		}
		// Fetch or create airport entity
		const airportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(airportProps.iata_code);
		let airportObjectProp: EntityContainer = {};
		if (!!store.airports.find({ '@id': { $eq: airportId } })[0]) {
			airportObjectProp[consts.ONTOLOGY.HAS_AIRPORT] = store.airports.find({ '@id': { $eq: airportId } })[0];
		} else {
			airportObjectProp = entityMaker(
				consts.ONTOLOGY.HAS_AIRPORT,
				consts.ONTOLOGY.ONT_AIRPORT,
				airportId,
				`${airportName}`);
			store.airports.insert(airportObjectProp[consts.ONTOLOGY.HAS_AIRPORT]);
		}

		if (airportName) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NAME] = airportName;
		}
		if (airportProps.gps_code) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = airportProps.gps_code;
		}
		if (airportProps.iata_code) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = airportProps.iata_code;
		}
		if (airportProps.wikipedia) {
			store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_WIKI_URI] = airportProps.wikipedia;
		}

		const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(airportProps.iata_code);
		let objectProp: EntityContainer = {};
		if (store.locations.find({ '@id': { $eq: geoId } })[0]) {
			objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.locations.find({ '@id': { $eq: geoId } })[0];
		} else {
			objectProp = entityMaker(
				consts.ONTOLOGY.HAS_LOCATION,
				consts.ONTOLOGY.ONT_GEO_LOCATION,
				geoId,
				`Geographic Location for ${airportName}`);
			store.locations.insert(objectProp[consts.ONTOLOGY.HAS_LOCATION]);
			store.airports.find({ '@id': { $eq: airportId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
		}
		const locAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
		const datatypeProp: { [key: string]: string|number } = {};
		if (locAttr && locAttr.datatypeProperties) {
			locAttr.datatypeProperties[consts.WGS84_POS.LAT] = airportLocation[1];
			locAttr.datatypeProperties[consts.WGS84_POS.LONG] = airportLocation[0];
			locAttr.datatypeProperties[consts.WGS84_POS.LAT_LONG] = `${airportLocation[1]}, ${airportLocation[0]}`;
		} else {
			datatypeProp[consts.WGS84_POS.LAT] = airportLocation[1];
			datatypeProp[consts.WGS84_POS.LONG] = airportLocation[0];
			datatypeProp[consts.WGS84_POS.LAT_LONG] = `${airportLocation[1]}, ${airportLocation[0]}`;
			locAttr.datatypeProperties = datatypeProp;
		}

		const airportSourceObject = store.airportTable[airportProps.iata_code || ''];
		const countryISO = airportSourceObject && airportSourceObject.iso;
		// Associate Country
		if (countryISO) {
			const countryId = countryToId(isoCodeToDataCode(countryISO));
			store.airports.find({ '@id': { $eq: airportId } })[0].objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					countryId
			));
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AIRPORT, airportObjectProp));

			// Get relative size of airport (small, medium, large)
			if (airportSourceObject.size) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_RELATIVE_SIZE] = airportSourceObject.size;
			}
			// Get type of airport (heliport, military, seaplanes, closed)
			if (airportSourceObject.type) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_TYPE] = airportSourceObject.type;
			}
			// Get status of airport (open, closed)
			if (airportSourceObject.status) {
				store.airports.find({ '@id': { $eq: airportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_STATUS] = airportSourceObject.status ? 'Open' : 'Closed';
			}
		}
	});
};