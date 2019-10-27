import * as fs from 'graceful-fs';
import * as path from 'path';

import JSZip from 'JSZip';

import { consts } from '../constants/constants';
import { store } from '../constants/globalStore';
import { saveFile } from './save-file';

export function saveFiles(files: string[], excludeOntology?: boolean): Promise<any> {
	return new Promise((resolve, reject) => {
		const ontologyRDFFiles = [];
		const ontologyJsonLdFiles = [];
		fs.readdirSync(path.join('constants', 'ontology')).forEach(file => {
			if (file.includes('.rdf')) {
				ontologyRDFFiles.push(file);
			} else if (file.includes('.schema.jsonld')) {
				ontologyJsonLdFiles.push(file);
			}
		});

		files = files.filter(name => name && name !== 'Download Ontologies');

		const storeNames = files.map(name => {
			const separatedName = name.split(' ');
			separatedName[0] = separatedName[0] && separatedName[0].toLowerCase();
			return separatedName.join('');
		}).filter(x => !!x);
		const fileNames = files.map(name => {
			const separatedName = name.split(' ');
			return separatedName.map(word => word && word.toLowerCase()).join('-');
		}).filter(x => !!x);

		const zip = JSZip();
		const imgsFolder = zip.folder('images');
		fs.readdirSync(path.join('temp', 'images')).forEach(async (fileName) => {
			try {
				const fileData = fs.readFileSync(path.join('temp', 'images', fileName));
				imgsFolder.file(fileName, fileData);
			} catch (err) {
				store.errorLogger(`Failed to read ${fileName} for downloading purposes.`);
			}
		});
		store.debugLogger(`Finished writing image files`);

		if (!excludeOntology) {
			const ontsFolder = zip.folder('ontologies');
			const ontsJsonLdFolder = ontsFolder.folder('jsonld');
			const ontsRDFFolder = ontsFolder.folder('rdf');

			ontologyJsonLdFiles.forEach(fileName => {
				let fileData;
				try {
					fileData = fs.readFileSync(path.join('constants', 'ontology', fileName));
					ontsJsonLdFolder.file(`${fileName}.schema.jsonld`, fileData);
				} catch (err) {
					store.errorLogger(`Failed to read ${fileName} for downloading purposes.`);
				}
			});

			ontologyRDFFiles.forEach(fileName => {
				let fileData;
				try {
					fileData = fs.readFileSync(path.join('constants', 'ontology', fileName));
					ontsRDFFolder.file(`${fileName}.rdf`, fileData);
				} catch (err) {
					store.errorLogger(`Failed to read ${fileName} for downloading purposes.`);
				}
			});
			store.debugLogger(`Finished writing ontology files`);
		}

		if (storeNames.length) {
			const entsFolder = zip.folder('entities');
			const entsJsonFolder = entsFolder.folder('json');
			const entsJsonLdFolder = entsFolder.folder('jsonld');
			const entsNTriplesFolder = entsFolder.folder('n-triples');

			storeNames.forEach((name: string, index: number) => {
				saveFile(name, fileNames[index], consts.ONTOLOGY.ONT_COUNTRY, [entsJsonFolder, entsJsonLdFolder, entsNTriplesFolder]);
			});
			store.debugLogger(`Finished writing entities files`);
		}

		zip.generateAsync({ type: 'nodebuffer' })
			.then((content: Buffer) => {
				// Force down of the Zip file
				fs.writeFileSync(path.join('..', 'data-glutton-ui', 'src', 'assets', 'data-glutton.zip'), content);
				resolve();
			})
			.catch(err => {
				store.errorLogger(`JSZip failed to make zip file: ${err.message}`);
				reject(`JSZip failed to make zip file: ${err.message}`);
			});
	});
};