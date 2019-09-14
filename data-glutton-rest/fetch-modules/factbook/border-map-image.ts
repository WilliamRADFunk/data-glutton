import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getBorderMapImg(cheerioElem: CheerioSelector, country: string, countryId: string): void {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	cheerioElem('div.locatorBox').each((index: number, element: CheerioElement) => {
		let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_BORDER_MAP);
		const a = cheerioElem(element).find('img').attr('src');
		let borderMapUrl;
		let bmId;
		if (a && a.replace('../', '')) {
			const borderMapId = a.replace('../', '');
			borderMapUrl = consts.BASE.URL_BASE_FACTBOOK + a.replace('../', '');
			bmId = consts.ONTOLOGY.INST_BORDER_MAP + getUuid.default(borderMapId);
		}
		let objectProp: EntityContainer = {};
		if (!map) {
			if (store.borderMaps.find({ '@id': { $eq: bmId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_BORDER_MAP] = store.borderMaps.find({ '@id': { $eq: bmId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_BORDER_MAP,
					consts.ONTOLOGY.ONT_BORDER_MAP,
					bmId,
					`Border Map for ${country}`);
				store.borderMaps.insert(objectProp[consts.ONTOLOGY.HAS_BORDER_MAP]);
			}
			map = objectProp[consts.ONTOLOGY.HAS_BORDER_MAP];
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_BORDER_MAP, objectProp));
		}
		if (borderMapUrl) {
			const datatypeProp: { [key: string]: string|number } = {};
			datatypeProp[consts.ONTOLOGY.DT_LOCATOR_URI] = borderMapUrl;
			map.datatypeProperties = datatypeProp;
		}
		// TODO: scrape physical image from url and store it.
	});
}
