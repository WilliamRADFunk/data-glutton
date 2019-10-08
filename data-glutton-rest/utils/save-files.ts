import JSZip from 'JSZip';
import { FileSaver } from 'file-saver';

import { consts } from '../constants/constants';
import { store } from '../constants/globalStore';
import { saveFile } from './save-file';

export function saveFiles(files: string[]) {
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
	const entsNTriplesFolder = entsFolder.folder('ntriples');

	storeNames.forEach((name: string, index: number) => {
		saveFile(name, fileNames[index], consts.ONTOLOGY.ONT_COUNTRY);
		entsJsonFolder.file(`${fileNames[index]}.json`);
		entsJsonLdFolder.file(`${fileNames[index]}.schema.jsonld`);
		entsNTriplesFolder.file(`${fileNames[index]}.n-triples`);
	});

	zip.generateAsync({ type: 'nodebuffer' })
		.then((content: Buffer) => {
			store.debugLogger(`${content.toString()}`);
			// Force down of the Zip file
			console.log('saveAs', FileSaver.saveAs);
			FileSaver.saveAs(content, 'archive.zip');
		})
		.catch(err => {
			store.errorLogger(`JSZip failed to make zip file: ${err.message}`)
		});
};