import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getClimate(cheerioElem: CheerioSelector, country: string, countryId: string) {
	const objectProperties = store.getObjectStore('countries')[countryId].objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_CLIMATE);
	let mapZone: Entity;
	let bailOut = true;
	cheerioElem('#field-climate').each(() => {
		if (!map) {
			const cId = consts.ONTOLOGY.INST_CLIMATE + getUuid.default(country);
			let objectProp: EntityContainer = {};
			if (store.getObjectStore('climates')[cId]) {
				objectProp[consts.ONTOLOGY.HAS_CLIMATE] = store.getObjectStore('climates')[cId];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_CLIMATE,
					consts.ONTOLOGY.ONT_CLIMATE,
					cId,
					`Climate for ${country}`);
				store.getObjectStore('climates')[cId] = objectProp[consts.ONTOLOGY.HAS_CLIMATE];
			}
			map = objectProp[consts.ONTOLOGY.HAS_CLIMATE];
			store.getObjectStore('countries')[countryId].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_CLIMATE, objectProp));
		}

		mapZone = getRelation(map.objectProperties, consts.ONTOLOGY.HAS_CLIMATE_ZONE);
		if (!mapZone) {
			let zone: EntityContainer = {};
			const czId = consts.ONTOLOGY.INST_CLIMATE_ZONE + getUuid.default(country);
			if (store.getObjectStore('climateZones')[czId]) {
				zone[consts.ONTOLOGY.HAS_CLIMATE_ZONE] = store.getObjectStore('climateZones')[czId];
			} else {
				const attr: { [key: string]: any } = {};
				attr[consts.ONTOLOGY.DT_CLIMATE_ZONE_NAME] = 'N/A';
				attr[consts.ONTOLOGY.DT_CLIMATE_ZONE_DESCRIPTION] = 'N/A';

				zone = entityMaker(
					consts.ONTOLOGY.HAS_CLIMATE_ZONE,
					consts.ONTOLOGY.ONT_CLIMATE_ZONE,
					czId,
					`Climate Zone for ${country}`);
				zone[consts.ONTOLOGY.HAS_CLIMATE_ZONE].datatypeProperties = attr;
				store.getObjectStore('climateZones')[czId] = zone[consts.ONTOLOGY.HAS_CLIMATE_ZONE];
			}
			mapZone = zone[consts.ONTOLOGY.HAS_CLIMATE_ZONE];
			map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_CLIMATE_ZONE, zone));
		}
		bailOut = false;
	});
	if (bailOut) {
		return;
	}
	cheerioElem('#field-climate').each((index: number, element: CheerioElement) => {
		const climGrd = cheerioElem(element).find('div.category_data.subfield.text').text().trim();
		if (climGrd) {
			const tempSplit = climGrd.replace(/\\n/g, '').trim().split(';');
			mapZone.datatypeProperties[consts.ONTOLOGY.DT_CLIMATE_ZONE_NAME] = tempSplit[0].trim();
			mapZone.datatypeProperties[consts.ONTOLOGY.DT_CLIMATE_ZONE_DESCRIPTION] = tempSplit.slice(1).join(';').trim();
			mapZone[consts.RDFS.label] = `Climate Zone (${mapZone.datatypeProperties[consts.ONTOLOGY.DT_CLIMATE_ZONE_NAME]})`;
		}
	});
}
