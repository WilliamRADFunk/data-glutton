import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { parsedSingleLine } from './scraper-forms/parsed-single-line';

export function getGeographicNotes(cheerioElem: CheerioSelector, country: string, countryId: string) {
	const objectProperties = store.getObjectStore('countries')[countryId].objectProperties;
	const prevHasList = objectProperties.filter((rel: EntityContainer) => rel[consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE]);
	let bailOut = true;
	cheerioElem('#field-geography-note').each(() => {
		bailOut = false;
	});
	if (bailOut) {
		return;
	}
	let useOptionA = false;
	cheerioElem('#field-geography-note > div.category_data.subfield.text').each(() => {
		useOptionA = true;
	});
	if (useOptionA) {
		const origParams = {
			cheerioElem,
			country,
			countryId
		};
		parsedSingleLine(
			origParams,
			'#field-geography-note',
			'HAS_GEOGRAPHIC_NOTE',
			'INST_GEOGRAPHIC_NOTE',
			'ONT_GEOGRAPHIC_NOTE',
			'geographicNotes',
			'DT_DESCRIPTION',
			'Geographic Note',
			';');
	} else {
		cheerioElem('#field-geography-note > div.category_data.note').each((index: number, element: CheerioElement) => {
			const geographicalNotes = cheerioElem(element).text().trim().replace(/\\n/g, '').trim();
			const notes = geographicalNotes.split(/note [0-9]+\:/);
			if (notes.length) {
				notes.forEach((note) => {
					let objectProp: EntityContainer = {};
					const dataPropItem = note.trim();
					const guid = consts.ONTOLOGY.INST_GEOGRAPHIC_NOTE + getUuid.default(dataPropItem);
					const hasPropAlready = prevHasList.some((p: EntityContainer) => p[consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE]['@id'].includes(guid));
					if (dataPropItem && !hasPropAlready) {
						if (store.getObjectStore('geographicNotes')[guid]) {
							objectProp[consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE] = store.getObjectStore('geographicNotes')[guid];
						} else {
							objectProp = entityMaker(
								consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE,
								consts.ONTOLOGY.ONT_GEOGRAPHIC_NOTE,
								guid,
								`Geographic Note (${dataPropItem})`);
							store.getObjectStore('geographicNotes')[guid] = objectProp[consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE];
						}
						objectProp[consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE].datatypeProperties[consts.ONTOLOGY.DT_DESCRIPTION] = dataPropItem;
						store.getObjectStore('countries')[countryId].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_GEOGRAPHIC_NOTE, objectProp));
					}
				});
			}
		});
	}
}
