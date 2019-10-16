import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { GeoFeature } from '../../models/geofeature';
import { SeaportProperties } from '../../models/seaport-properties';
import { isoCodeToDataCode, seaportDataLocal } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

export function getSeaportsFromGeoJson(): void {
	const totalItems = Object.keys(seaportDataLocal.features).length;
	let lastPercentageEmitted = 0;
	Object.values(seaportDataLocal.features).forEach((sp: GeoFeature, index: number) => {
		if (lastPercentageEmitted !== Math.floor((index / totalItems) * 100)) {
			store.progressLogger('SeaportsFromGeoJson', index / totalItems);
			lastPercentageEmitted = Math.floor((index / totalItems) * 100);
		}
		const seaportProps: SeaportProperties = sp.properties as SeaportProperties;
		const seaportName = seaportProps.name && seaportProps.name.replace('Int\'l', 'International');
		const seaportLocation = ap.geometry.coordinates;

		 // No IATA code, no id. No id, no seaport.
		if (!seaportProps.iata_code) {
			return;
		}
		// Fetch or create seaport entity
		const seaportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(seaportProps.iata_code);
		let seaportObjectProp: EntityContainer = {};
		if (!!store.seaports.find({ '@id': { $eq: seaportId } })[0]) {
			seaportObjectProp[consts.ONTOLOGY.HAS_AIRPORT] = store.seaports.find({ '@id': { $eq: seaportId } })[0];
		} else {
			seaportObjectProp = entityMaker(
				consts.ONTOLOGY.HAS_AIRPORT,
				consts.ONTOLOGY.ONT_AIRPORT,
				seaportId,
				`${seaportName}`);
			store.seaports.insert(seaportObjectProp[consts.ONTOLOGY.HAS_AIRPORT]);
		}

		if (seaportName) {
			store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NAME] = seaportName;
		}
		if (seaportProps.gps_code) {
			store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = seaportProps.gps_code;
		}
		if (seaportProps.iata_code) {
			store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = seaportProps.iata_code;
		}
		if (seaportProps.wikipedia) {
			store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_WIKI_URI] = seaportProps.wikipedia;
		}

		const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(seaportProps.iata_code);
		let objectProp: EntityContainer = {};
		if (store.locations.find({ '@id': { $eq: geoId } })[0]) {
			objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.locations.find({ '@id': { $eq: geoId } })[0];
		} else {
			objectProp = entityMaker(
				consts.ONTOLOGY.HAS_LOCATION,
				consts.ONTOLOGY.ONT_GEO_LOCATION,
				geoId,
				`Geographic Location for ${seaportName}`);
			store.locations.insert(objectProp[consts.ONTOLOGY.HAS_LOCATION]);
			store.seaports.find({ '@id': { $eq: seaportId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
		}
		const locAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
		const datatypeProp: { [key: string]: string|number } = {};
		if (locAttr && locAttr.datatypeProperties) {
			locAttr.datatypeProperties[consts.WGS84_POS.LAT] = seaportLocation[1];
			locAttr.datatypeProperties[consts.WGS84_POS.LONG] = seaportLocation[0];
			locAttr.datatypeProperties[consts.WGS84_POS.LAT_LONG] = `${seaportLocation[1]}, ${seaportLocation[0]}`;
		} else {
			datatypeProp[consts.WGS84_POS.LAT] = seaportLocation[1];
			datatypeProp[consts.WGS84_POS.LONG] = seaportLocation[0];
			datatypeProp[consts.WGS84_POS.LAT_LONG] = `${seaportLocation[1]}, ${seaportLocation[0]}`;
			locAttr.datatypeProperties = datatypeProp;
		}

		const seaportSourceObject = store.seaportTable[seaportProps.iata_code || ''];
		const countryISO = seaportSourceObject && seaportSourceObject.iso;
		// Associate Country
		if (countryISO) {
			const countryId = countryToId(isoCodeToDataCode(countryISO));
			store.seaports.find({ '@id': { $eq: seaportId } })[0].objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					countryId
			));
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AIRPORT, seaportObjectProp));

			// Get relative size of seaport (small, medium, large)
			if (seaportSourceObject.size) {
				store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_RELATIVE_SIZE] = seaportSourceObject.size;
			}
			// Get type of seaport (heliport, military, seaplanes, closed)
			if (seaportSourceObject.type) {
				store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_TYPE] = seaportSourceObject.type;
			}
			// Get status of seaport (open, closed)
			if (seaportSourceObject.status) {
				store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_STATUS] = seaportSourceObject.status ? 'Open' : 'Closed';
			}
		}
	});
};