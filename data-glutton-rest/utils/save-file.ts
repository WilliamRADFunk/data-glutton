import * as fs from 'graceful-fs';

import { Entity } from 'funktologies';

import { consts } from '../constants/constants';
import { store } from '../constants/globalStore';

export function saveFile(storeName: string, fileName: string, context: string, folders: any[]): void {
	// Normal JSON file.
	folders[0].file(`${fileName}.json`, JSON.stringify(store[storeName].chain().simplesort(consts.RDFS.label).data()));
	// JSON-LD file construction.
	store.jsonLD = [];

	const asAList: Entity[] = store[storeName].chain().simplesort(consts.RDFS.label).data();
	const length = asAList.length;

	for (let i = 0; i < length; i++) {
		const entity = asAList.pop();
		if (!entity) {
			continue;
		}
		// Grab the basic @id, @type, and rdfs label
		const mainObj = {
			'@id': entity['@id'],
			'@type': entity['@type'],
			'http://www.w3.org/2000/01/rdf-schema#label': entity[consts.RDFS.label]
		};
		// Pull datatype properties out of their singleton object and make them direct props.
		const dataProps = entity.datatypeProperties;
		Object.keys(dataProps).forEach(key2 => {
			mainObj[key2] = dataProps[key2];
		});
		// Pull out object properties, and make them direct properties but with array groups for multiples.
		const objectProps = entity.objectProperties;
		objectProps.forEach(objP => {
			// Should be one key per object
			const key = Object.keys(objP)[0];
			if (mainObj[key]) {
				if (Array.isArray(mainObj[key])) {
					mainObj[key].push(objP[key]);
				} else {
					mainObj[key] = [mainObj[key], objP[key]];
				}
			} else {
				mainObj[key] = objP[key];
			}
		})
		// Add it to the graph that belongs to this entity type.
		// jsonLD['@graph'].push(mainObj);
		store.jsonLD.push(mainObj);
	};

	folders[1].file(`${fileName}.schema.jsonld`, JSON.stringify(store.jsonLD));

	convertJsonldToNTriples();

	folders[2].file(`${fileName}.schema.nt`, store.jsonNT);
	store.jsonNT = '';
};

function convertJsonldToNTriples(): void {
	const length = store.jsonLD.length;
	for (let i = 0; i < length; i++) {
		const entity = store.jsonLD.pop();
		if (entity) {
			const mainId = entity['@id'];
			const mainLabel = entity['http://www.w3.org/2000/01/rdf-schema#label'];
			const mainType = entity['@type'];
			store.jsonNT += `<${mainId}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(mainLabel)} .\n`;
			store.jsonNT += `<${mainId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${mainType}> .\n`;
			Object.entries(entity).forEach(entry => {
				if (['@id', '@type', 'http://www.w3.org/2000/01/rdf-schema#label'].includes(entry[0])) {
					// Taken care of already.
				} else if (Array.isArray(entry[1])) {
					entry[1].forEach(innerEntry => {
						store.jsonNT += `<${mainId}> <${entry[0]}> <${innerEntry['@id']}> .\n`;
						store.jsonNT += `<${innerEntry['@id']}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(innerEntry['http://www.w3.org/2000/01/rdf-schema#label'])} .\n`;
						store.jsonNT += `<${innerEntry['@id']}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${innerEntry['@type']}> .\n`;
					});
				} else if(entry[1] && typeof entry[1] === 'object') {
					store.jsonNT += `<${mainId}> <${entry[0]}> <${entry[1]['@id']}> .\n`;
					store.jsonNT += `<${entry[1]['@id']}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(entry[1]['http://www.w3.org/2000/01/rdf-schema#label'])} .\n`;
					store.jsonNT += `<${entry[1]['@id']}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${entry[1]['@type']}> .\n`;
				} else {
					const val = JSON.stringify(entry[1]);
					if (val.split('"').length > 1) {
						store.jsonNT += `<${mainId}> <${entry[0]}> ${val}^^<http://www.w3.org/2001/XMLSchema#string> .\n`;
					} else if (val.split('.').length > 1) {
						store.jsonNT += `<${mainId}> <${entry[0]}> "${val}"^^<http://www.w3.org/2001/XMLSchema#double> .\n`;
					} else {
						store.jsonNT += `<${mainId}> <${entry[0]}> "${val}"^^<http://www.w3.org/2001/XMLSchema#integer> .\n`;
					}
				}
			});
		}
	}
};
