import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getLandUses(cheerioElem: CheerioSelector, country: string, countryId: string) {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_LAND_USE);
	const luId = consts.ONTOLOGY.INST_LAND_USE + getUuid.default(country);
	let objectProp: EntityContainer = {};
	let bailOut = true;
	cheerioElem('#field-land-use').each(() => {
		if (!map) {
			if (store.landUses.find({ '@id': { $eq: luId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_LAND_USE] = store.landUses.find({ '@id': { $eq: luId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_LAND_USE,
					consts.ONTOLOGY.ONT_LAND_USE,
					luId,
					`Land Use for ${country}`);
				store.landUses.insert(objectProp[consts.ONTOLOGY.HAS_LAND_USE]);
			}
			map = objectProp[consts.ONTOLOGY.HAS_LAND_USE];
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LAND_USE, objectProp));
		}
		bailOut = false;
	});
	if (bailOut) {
		return;
	}
	cheerioElem('#field-land-use div.category_data.subfield.numeric').each((index: number, element: CheerioElement) => {
		const landUse1Switch = cheerioElem(element).find('span.subfield-name').text().trim();
		const landUse1Data = cheerioElem(element).find('span.subfield-number').text().trim();
		const date1Data = cheerioElem(element).find('span.subfield-date').text().trim();
		const refinedValue1 = landUse1Data.replace(/[^0-9\-\.]/g, '').trim() || null;
		if (refinedValue1) {
			let objectP: EntityContainer = {};
			switch (landUse1Switch) {
				case 'agricultural land:': {
					const alId = consts.ONTOLOGY.INST_AGRICULTURAL_LAND + getUuid.default(country);
					objectP = entityMaker(
						consts.ONTOLOGY.HAS_AGRICULTURAL_LAND,
						consts.ONTOLOGY.ONT_AGRICULTURAL_LAND,
						alId,
						`Agricultural Land Use for ${country}`);
					const agLandRef = objectP[consts.ONTOLOGY.HAS_AGRICULTURAL_LAND];
					store.agriculturalLands.insert(agLandRef);
					map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AGRICULTURAL_LAND, objectP));
					agLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = landUse1Data.replace(/[^0-9\-\.]/g, '').trim() || null;
					agLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = date1Data.substring(date1Data.indexOf('('), date1Data.indexOf(')') + 1).trim() || 'N/A';
					break;
				}
				case 'forest:': {
					const fId = consts.ONTOLOGY.INST_FOREST_LAND + getUuid.default(country);
					objectP = entityMaker(
						consts.ONTOLOGY.HAS_FOREST_LAND,
						consts.ONTOLOGY.ONT_FOREST_LAND,
						fId,
						`Forest Land Use for ${country}`);
					const fLandRef = objectP[consts.ONTOLOGY.HAS_FOREST_LAND];
					store.forestLands.insert(fLandRef);
					map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_FOREST_LAND, objectP));
					fLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = landUse1Data.replace(/[^0-9\-\.]/g, '').trim() || null;
					fLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = date1Data.substring(date1Data.indexOf('('), date1Data.indexOf(')') + 1).trim() || 'N/A';
					break;
				}
				case 'other:': {
					const oId = consts.ONTOLOGY.INST_OTHER_LAND + getUuid.default(country);
					objectP = entityMaker(
						consts.ONTOLOGY.HAS_OTHER_LAND,
						consts.ONTOLOGY.ONT_OTHER_LAND,
						oId,
						`Other Land Use for ${country}`);
					const oLandRef = objectP[consts.ONTOLOGY.HAS_OTHER_LAND];
					store.otherLands.insert(oLandRef);
					map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_OTHER_LAND, objectP));
					oLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = landUse1Data.replace(/[^0-9\-\.]/g, '').trim() || null;
					oLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = date1Data.substring(date1Data.indexOf('('), date1Data.indexOf(')') + 1).trim() || 'N/A';
					break;
				}
			}
		}
	});
	cheerioElem('#field-land-use div.category_data.subfield.grouped_subfield').each((index: number, element: CheerioElement) => {
		const landUse2Data = cheerioElem(element).text().trim();
		const groupSplit = landUse2Data.split('/').map((land) => land.trim());
		const percentages = groupSplit.map((land) => land.substring(0, land.indexOf('%')).replace(/[^0-9\-\.]/g, '').trim());
		const dates = groupSplit.map((land) => land.substring(land.indexOf('('), land.indexOf(')') + 1).trim());
		if (percentages.length) {
			// Arable Land
			const arbId = consts.ONTOLOGY.INST_ARABLE_LAND + getUuid.default(country);
			const objectPropArable = entityMaker(
				consts.ONTOLOGY.HAS_ARABLE_LAND,
				consts.ONTOLOGY.ONT_ARABLE_LAND,
				arbId,
				`Arable Land Use for ${country}`);
			const arbLandRef = objectPropArable[consts.ONTOLOGY.HAS_ARABLE_LAND];
			store.arableLands.insert(arbLandRef);
			map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_ARABLE_LAND, objectPropArable));
			let percent = percentages[0] || null;
			if (percent) {
				arbLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = percent;
			}
			arbLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = dates[0] || 'N/A';
			// Permanent Crops Land
			const pcId = consts.ONTOLOGY.INST_PERMANENT_CROPS_LAND + getUuid.default(country);
			const objectPropPermCrop = entityMaker(
				consts.ONTOLOGY.HAS_PERMANENT_CROPS_LAND,
				consts.ONTOLOGY.ONT_PERMANENT_CROPS_LAND,
				pcId,
				`Permanent Crops Land Use for ${country}`);
			const pcLandRef = objectPropPermCrop[consts.ONTOLOGY.HAS_PERMANENT_CROPS_LAND];
			store.permanentCropsLands.insert(pcLandRef);
			map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_PERMANENT_CROPS_LAND, objectPropPermCrop));
			percent = percentages[1] || null;
			if (percent) {
				pcLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = percent;
			}
			pcLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = dates[1] || 'N/A';
			// Permanent Pasture Land
			const ppId = consts.ONTOLOGY.INST_PERMANENT_PASTURE_LAND + getUuid.default(country);
			const objectPropPermPast = entityMaker(
				consts.ONTOLOGY.HAS_PERMANENT_PASTURE_LAND,
				consts.ONTOLOGY.ONT_PERMANENT_PASTURE_LAND,
				ppId,
				`Permanent Pasture Land Use for ${country}`);
			const ppLandRef = objectPropPermPast[consts.ONTOLOGY.HAS_PERMANENT_PASTURE_LAND];
			store.permanentPastureLands.insert(ppLandRef);
			map.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_PERMANENT_PASTURE_LAND, objectPropPermPast));
			percent = percentages[2] || null;
			if (percent) {
				ppLandRef.datatypeProperties[consts.ONTOLOGY.DT_PERCENTAGE] = percent;
			}
			ppLandRef.datatypeProperties[consts.ONTOLOGY.DT_LAST_ESTIMATED] = dates[2] || 'N/A';
		}
	});
}
