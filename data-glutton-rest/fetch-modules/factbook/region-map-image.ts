import * as htmlToText from 'html-to-text';
import * as download from 'image-downloader';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export async function getRegionMapImg(cheerioElem: CheerioSelector, country: string, countryId: string): Promise<void> {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	const photos = cheerioElem('div.mapBox').toArray();
	for (let i = 0; i < photos.length; i++) {
		const element: CheerioElement = photos[i];
		let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_REGION_MAP);
		const rmId = consts.ONTOLOGY.INST_REGION_MAP + getUuid.default(country);
		let objectProp: EntityContainer = {};
		objectProp[consts.ONTOLOGY.HAS_REGION_MAP] = map;
		if (!map) {
			if (store.regionMaps.find({ '@id': { $eq: rmId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_REGION_MAP] = store.regionMaps.find({ '@id': { $eq: rmId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_REGION_MAP,
					consts.ONTOLOGY.ONT_REGION_MAP,
					rmId,
					`Region Map for ${country}`);
			}
			map = objectProp[consts.ONTOLOGY.HAS_REGION_MAP];
		}
		const a = cheerioElem(element).find('img').attr('src');
		let b = cheerioElem(element).find('img').attr('alt');
		b = b && htmlToText.fromString(b);
		let regionMapImgUrl;
		if (a && a.replace('../', '')) {
			regionMapImgUrl = consts.BASE.URL_BASE_FACTBOOK + a.replace('../', '');
			if (regionMapImgUrl && !regionMapImgUrl.includes('locator-map')) {
				const datatypeProp: { [key: string]: string|number } = {};
				datatypeProp[consts.ONTOLOGY.DT_LOCATOR_URI] = regionMapImgUrl;
				map.datatypeProperties = datatypeProp;

				const previousElement = store.regionMaps.find({ '@id': { $eq: map["@id"] } })[0];
				if (previousElement) {
					Object.keys(map).forEach(key => {
						previousElement[key] = map[key];
					});
					store.regionMaps.update(previousElement);
				} else {
					store.regionMaps.insert(map);
				}
				store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_REGION_MAP, objectProp));

				datatypeProp[consts.ONTOLOGY.DT_CONTENT_DESCRIPTION] = b || null;
				map.datatypeProperties = datatypeProp;

				const pathSplit: string[] = regionMapImgUrl.split('/');
				const fileName: string = pathSplit[pathSplit.length - 1].split('?')[0].toLowerCase();
				datatypeProp[consts.ONTOLOGY.DT_MIME_TYPE] = fileName.split('.')[1];
				datatypeProp[consts.ONTOLOGY.DT_COLLECTION_TIMESTAMP] = (new Date()).toISOString();
				datatypeProp[consts.ONTOLOGY.DT_CONTENTS] = fileName;

				const options = {
					dest: `temp/images/${fileName}`,
					timeout: consts.BASE.DATA_REQUEST_TIMEOUT,
					url: regionMapImgUrl
				};

				async function downloadImg() {
					try {
						const { filename, image } = await download.image(options)
						store.debugLogger(`File saved to ${filename}`);
					} catch (err) {
						store.errorLogger(`~~~~ Failed to download: ${fileName}, ${err}`);
						if (err.message.indexOf('404') < 0) {
							throw Error(`~~~~ Failed to download image from : ${country}, ${err}`);
						}
					}
				}

				await downloadImg();
			}
		}
	};
}
