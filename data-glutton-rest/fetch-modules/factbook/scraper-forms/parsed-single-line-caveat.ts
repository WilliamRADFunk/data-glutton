import * as getUuid from 'uuid-by-string';

import { consts } from '../../../constants/constants';
import { store } from '../../../constants/globalStore';
import { EntityContainer } from '../../../models/entity-container';
import { entityMaker } from '../../../utils/entity-maker';
import { entityRefMaker } from '../../../utils/entity-ref-maker';

export function parsedSingleLineCaveat(
	origParams: { cheerioElem: CheerioSelector; country: string; countryId: string; },
	dataId: string,
	hasProp: string,
	instProp: string,
	baseOntProp: string,
	storeKey: string,
	dataPropName: string,
	label: string,
 delimiter: (string | RegExp),
 upto: string
): void {
	const objectProperties = store.countries.find({ '@id': { $eq: origParams.countryId } })[0].objectProperties || [];
	const prevHasList = objectProperties.filter((rel: EntityContainer) => rel[consts.ONTOLOGY[hasProp]]);
	origParams.cheerioElem(dataId).each((index: number, element: CheerioElement) => {
		const rawScrapedList = origParams.cheerioElem(element).find('div.category_data.subfield.text').text().trim();
		if (rawScrapedList) {
			const splitList = rawScrapedList.substring(0, rawScrapedList.indexOf(upto)).split(delimiter).map((x) => x.replace(/\\n/g, '').trim());
			splitList.forEach((resource) => {
				const dataPropItem = resource.trim();
				const guid = consts.ONTOLOGY[instProp] + getUuid.default(dataPropItem);
				const hasPropAlready = prevHasList.some((p: EntityContainer) => p[consts.ONTOLOGY[hasProp]]['@id'].includes(guid));
				if (dataPropItem && !hasPropAlready) {
					let objectProp: EntityContainer = {};
					if (store[storeKey].find({ '@id': { $eq: guid } })[0]) {
						objectProp[consts.ONTOLOGY[hasProp]] = store[storeKey].find({ '@id': { $eq: guid } })[0];
					} else {
						objectProp = entityMaker(
							consts.ONTOLOGY[hasProp],
							consts.ONTOLOGY[baseOntProp],
							guid,
							`${label} (${dataPropItem})`);
						store[storeKey].insert(objectProp[consts.ONTOLOGY[hasProp]]);
					}
					objectProp[consts.ONTOLOGY[hasProp]].datatypeProperties[consts.ONTOLOGY[dataPropName]] = dataPropItem;
					store.countries.find({ '@id': { $eq: origParams.countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY[hasProp], objectProp));
				}
			});
		} else {
			return;
		}
	});
}
