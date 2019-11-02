import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getMaritimeClaims(cheerioElem: CheerioSelector, country: string, countryId: string) {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_MARITIME_CLAIM);
	const mcId = consts.ONTOLOGY.INST_MARITIME_CLAIM + getUuid.default(country);
	let objectProp: EntityContainer = {};
	let bailOut = true;
	cheerioElem('#field-maritime-claims').each(() => {
		if (!map) {
			if (store.maritimeClaims.find({ '@id': { $eq: mcId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_MARITIME_CLAIM] = store.maritimeClaims.find({ '@id': { $eq: mcId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_MARITIME_CLAIM,
					consts.ONTOLOGY.ONT_MARITIME_CLAIM,
					mcId,
					`Maritime Claim for ${country}`);
				store.maritimeClaims.insert(objectProp[consts.ONTOLOGY.HAS_MARITIME_CLAIM]);
			}
			map = objectProp[consts.ONTOLOGY.HAS_MARITIME_CLAIM];
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_MARITIME_CLAIM, objectProp));
		}
		bailOut = false;
	});
	if (bailOut) {
		return;
	}
	cheerioElem('#field-maritime-claims > div.category_data.subfield.numeric').each((index: number, element: CheerioElement) => {
		const seaSwitch = cheerioElem(element).find('span.subfield-name').text().trim();
		const seaData = cheerioElem(element).find('span.subfield-number').text().trim();
		const zoneTxt = seaData.replace(/,|[a-z]/g, '').trim() || null;
		if (zoneTxt) {
			switch (seaSwitch) {
				case 'territorial sea:': {
					map.datatypeProperties[consts.ONTOLOGY.DT_TERRITORIAL_SEA] = zoneTxt;
					break;
				}
				case 'exclusive economic zone:': {
					map.datatypeProperties[consts.ONTOLOGY.DT_EXCLUSIVE_ECONOMIC_ZONE] = zoneTxt;
					break;
				}
				case 'contiguous zone:': {
					map.datatypeProperties[consts.ONTOLOGY.DT_CONTIGUOUS_ZONE] = zoneTxt;
					break;
				}
				case 'exclusive fishing zone:': {
					map.datatypeProperties[consts.ONTOLOGY.DT_EXCLUSIVE_FISHING_ZONE] = zoneTxt;
					break;
				}
				case 'continental shelf:': {
					map.datatypeProperties[consts.ONTOLOGY.DT_CONTINENTAL_SHELF] = zoneTxt;
					const modifier = seaData.substring(seaData.indexOf('nm or') + 5).trim() || null;
					if (modifier) {
						map.datatypeProperties[consts.ONTOLOGY.DT_CONTINENTAL_SHELF_MODIFIER] = modifier;
					}
					break;
				}
			}
		}
	});
	map.datatypeProperties[consts.ONTOLOGY.DT_UNIT] = 'nm';
	cheerioElem('#field-maritime-claims > div.category_data.note').each((index: number, element: CheerioElement) => {
		const supplementalExplanation = cheerioElem(element).text().replace(/\\n/g, ' ').trim();
		if (supplementalExplanation) {
			map.datatypeProperties[consts.ONTOLOGY.DT_SUPPLEMENTAL_EXPLANATION] = supplementalExplanation;
		}
	});
}
