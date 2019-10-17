import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { SeaportGeoFeature } from '../../models/geofeature';
import { SeaportProperties } from '../../models/seaport-properties';
import { seaportDataLocal } from '../../utils/country-code-lookup-tables';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

export function getSeaportsFromGeoJson(): void {
	const totalItems = Object.keys(seaportDataLocal.features).length;
	let lastPercentageEmitted = 0;
	Object.values(seaportDataLocal.features).forEach((sp: SeaportGeoFeature, index: number) => {
		if (lastPercentageEmitted !== Math.floor((index / totalItems) * 100)) {
			store.progressLogger('SeaportsFromGeoJson', index / totalItems);
			lastPercentageEmitted = Math.floor((index / totalItems) * 100);
		}
		const seaportProps: SeaportProperties = sp.properties as SeaportProperties;
		const seaportName = seaportProps.name && seaportProps.name;
		const seaportWebsite = seaportProps.website;
		const seaportLocation = sp.geometry.coordinates;

		 // No IATA code, no id. No id, no seaport.
		if (!seaportProps.name) {
			return;
		}
		// Fetch or create seaport entity
		const seaportId = consts.ONTOLOGY.INST_SEAPORT + getUuid.default(seaportProps.name);
		let seaportObjectProp: EntityContainer = {};
		if (!!store.seaports.find({ '@id': { $eq: seaportId } })[0]) {
			seaportObjectProp[consts.ONTOLOGY.HAS_SEAPORT] = store.seaports.find({ '@id': { $eq: seaportId } })[0];
		} else {
			seaportObjectProp = entityMaker(
				consts.ONTOLOGY.HAS_SEAPORT,
				consts.ONTOLOGY.ONT_SEAPORT,
				seaportId,
				`${seaportName}`);
			seaportObjectProp[consts.ONTOLOGY.HAS_SEAPORT].datatypeProperties[consts.ONTOLOGY.DT_NAME] = seaportName;
			store.seaports.insert(seaportObjectProp[consts.ONTOLOGY.HAS_SEAPORT]);
		}
		if (seaportWebsite) {
			store.seaports.find({ '@id': { $eq: seaportId } })[0].datatypeProperties[consts.ONTOLOGY.DT_WIKI_URI] = seaportWebsite;
		}

		const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(seaportName);
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
	});
};