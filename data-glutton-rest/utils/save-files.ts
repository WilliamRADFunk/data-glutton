import * as fs from 'graceful-fs';
import * as path from 'path';

import JSZip from 'JSZip';

import { consts } from '../constants/constants';
import { store } from '../constants/globalStore';
import { saveFile } from './save-file';

export function saveFiles(files: string[]): Promise<any> {
	return new Promise((resolve, reject) => {
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
		const entsFolder = zip.folder('entities');
		const entsJsonFolder = entsFolder.folder('json');
		const entsJsonLdFolder = entsFolder.folder('jsonld');
		const entsNTriplesFolder = entsFolder.folder('n-triples');

		storeNames.forEach((name: string, index: number) => {
			saveFile(name, fileNames[index], consts.ONTOLOGY.ONT_COUNTRY, [entsJsonFolder, entsJsonLdFolder, entsNTriplesFolder]);
		});

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