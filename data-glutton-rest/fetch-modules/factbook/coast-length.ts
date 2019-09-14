import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getCoastLength(cheerioElem: CheerioSelector, country: string, countryId: string) {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_COAST);
	const clId = consts.ONTOLOGY.INST_COAST + getUuid.default(country);
	let objectProp: EntityContainer = {};
	let bailOut = true;
	cheerioElem('#field-coastline').each(() => {
		if (!map) {
			if (store.coasts.find({ '@id': { $eq: clId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_COAST] = store.coasts.find({ '@id': { $eq: clId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_COAST,
					consts.ONTOLOGY.ONT_COAST,
					clId,
					`Coast of ${country}`);
				store.coasts.insert(objectProp[consts.ONTOLOGY.HAS_COAST]);
			}
			map = objectProp[consts.ONTOLOGY.HAS_COAST];
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_COAST, objectProp));
		}
		bailOut = false;
	});
	if (bailOut) {
		return;
	}
	cheerioElem('#field-coastline').each((index: number, element: CheerioElement) => {
		const coastGrd = cheerioElem(element).find('div.category_data.subfield.numeric').text().trim();
		if (coastGrd) {
			const coastGrdSplit = coastGrd.split('km');
			map.datatypeProperties[consts.ONTOLOGY.DT_LENGTH] = coastGrdSplit[0].trim();
			map.datatypeProperties[consts.ONTOLOGY.DT_LENGTH_MODIFIER] = coastGrdSplit.slice(1).join('km').replace(/\\n/g, '').trim() || null;
		}
	});
	map.datatypeProperties[consts.ONTOLOGY.DT_UNIT] = 'km';
}
