import * as fs from 'graceful-fs';
import * as path from 'path';

import { Entity } from 'funktologies';

import { consts } from '../constants/constants';
import { store } from '../constants/globalStore';

export function saveFile(storeName: string, fileName: string, context: string, folders: any[]): void {
	if (!storeName || !store[storeName] || !fileName) {
		store.errorLogger(`Couldn't translate ${storeName} into a store value for ${fileName}.json`);
		return;
	}
	store.debugLogger(`Attempting to write files for ${fileName}`);
	// Create json-ld file for this entity type.
	try {
		fs.writeFileSync(path.join('temp', 'entities', 'jsonld', `${fileName}.schema.jsonld`), '[\n');
	} catch(err) {
		store.errorLogger(`Failed to write jsonld file ${fileName}: ${err}`);
	}
	// Create n-triples file for this entity type.
	try {
		fs.writeFileSync(path.join('temp', 'entities', 'n-triples', `${fileName}.schema.nt`), '');
	} catch(err) {
		store.errorLogger(`Failed to write jsonld file ${fileName}: ${err}`);
	}
	// Organize entities into jsonld format, which will make n-triple format easier later as well.
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
		});
		// Add it to the graph that belongs to this entity type.
		store.jsonLD.push(mainObj);
	};
	// Write jsonld entities to file one at a time and then add to zip bundle.
	store.jsonLD.forEach(ent => {
		fs.appendFileSync(path.join('temp', 'entities', 'jsonld', `${fileName}.schema.jsonld`), `${JSON.stringify(ent)},\n`);
		store.debugLogger(`    Appended ${ent['@id']} to file: ${fileName}.schema.jsonld`);
	});
	fs.appendFileSync(path.join('temp', 'entities', 'jsonld', `${fileName}.schema.jsonld`), ']');
	// Reading jsonld file in order to add it to the bundle.
	try {
		let jsonldFileData = fs.readFileSync(path.join('temp', 'entities', 'jsonld', `${fileName}.schema.jsonld`));
		folders[0].file(`${fileName}.schema.jsonld`, jsonldFileData);
		store.debugLogger(`Finished writing ${fileName}.schema.jsonld`);
		jsonldFileData = null;
	} catch(err) {
		store.errorLogger(`Failed to read jsonld file ${fileName}: ${err}`);
	}
	// Write ntriple entities to file one at a time and then add to zip bundle.
	convertJsonldToNTriples(fileName);
	// Reading n-triples file in order to add it to the bundle.
	try {
		let ntriplesFileData = fs.readFileSync(path.join('temp', 'entities', 'n-triples', `${fileName}.schema.nt`));
		folders[1].file(`${fileName}.schema.nt`, ntriplesFileData);
		store.debugLogger(`Finished writing ${fileName}.schema.nt`);
		ntriplesFileData = null;
	} catch(err) {
		store.errorLogger(`Failed to read ntriples file ${fileName}: ${err}`);
	}
	// Clean up after entity type.
	store.jsonLD.length = 0;
};

function convertJsonldToNTriples(fileName: string): void {
	const length = store.jsonLD.length;
	for (let i = 0; i < length; i++) {
		const entity = store.jsonLD.pop();
		let jsonNT = '';
		if (entity) {
			const mainId = entity['@id'];
			const mainLabel = entity['http://www.w3.org/2000/01/rdf-schema#label'];
			const mainType = entity['@type'];
			jsonNT += `<${mainId}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(mainLabel)} .\n`;
			jsonNT += `<${mainId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${mainType}> .\n`;
			Object.entries(entity).forEach(entry => {
				if (['@id', '@type', 'http://www.w3.org/2000/01/rdf-schema#label'].includes(entry[0])) {
					// Taken care of already.
				} else if (Array.isArray(entry[1])) {
					entry[1].forEach(innerEntry => {
						jsonNT += `<${mainId}> <${entry[0]}> <${innerEntry['@id']}> .\n`;
						jsonNT += `<${innerEntry['@id']}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(innerEntry['http://www.w3.org/2000/01/rdf-schema#label'])} .\n`;
						jsonNT += `<${innerEntry['@id']}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${innerEntry['@type']}> .\n`;
					});
				} else if(entry[1] && typeof entry[1] === 'object') {
					jsonNT += `<${mainId}> <${entry[0]}> <${entry[1]['@id']}> .\n`;
					jsonNT += `<${entry[1]['@id']}> <http://www.w3.org/2000/01/rdf-schema#label> ${JSON.stringify(entry[1]['http://www.w3.org/2000/01/rdf-schema#label'])} .\n`;
					jsonNT += `<${entry[1]['@id']}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${entry[1]['@type']}> .\n`;
				} else {
					const val = JSON.stringify(entry[1]);
					if (val.split('"').length > 1) {
						jsonNT += `<${mainId}> <${entry[0]}> ${val}^^<http://www.w3.org/2001/XMLSchema#string> .\n`;
					} else if (val.split('.').length > 1) {
						jsonNT += `<${mainId}> <${entry[0]}> "${val}"^^<http://www.w3.org/2001/XMLSchema#double> .\n`;
					} else {
						jsonNT += `<${mainId}> <${entry[0]}> "${val}"^^<http://www.w3.org/2001/XMLSchema#integer> .\n`;
					}
				}
			});

			fs.appendFileSync(path.join('temp', 'entities', 'n-triples', `${fileName}.schema.nt`), jsonNT);
			store.debugLogger(`    Appended ${mainId} to file: ${fileName}.schema.nt`);
		}
	}
};
