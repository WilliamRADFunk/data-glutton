import * as htmlToText from 'html-to-text';
import * as download from 'image-downloader';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

export async function getSupplementalImages(cheerioElem: CheerioSelector, country: string, countryId: string): Promise<void> {
	const objectProperties = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties;
	const photos = cheerioElem('div.item.photo-all').toArray();
	for (let i = 0; i < photos.length; i++) {
		const element: CheerioElement = photos[i];
		const suppImages = objectProperties.filter((rel: EntityContainer) => rel[consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG]);
		const a = cheerioElem(element).find('img').attr('src');
		let b = cheerioElem(element).find('img').attr('alt');
		const c = cheerioElem(element).find(cheerioElem('div.carousel-photo-info .photoInfo .flag_description_text'));
		const imageProps: string[] = [];
		c.each(() => { imageProps.push(cheerioElem(element).text().trim()); });
		b = b && htmlToText.fromString(b);
		let imgId: string;
		let suppImgUrl: string;
		if (a && a.replace('../', '')) {
			const cleanSrc = a.replace('../', '');
			imgId = consts.ONTOLOGY.INST_IMAGE + getUuid.default(cleanSrc);
			suppImgUrl = consts.BASE.URL_BASE_FACTBOOK + cleanSrc;
		}
		if (suppImgUrl && !suppImages.some((img: EntityContainer) => img[consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG]['@id'].includes(imgId))) {
			let objectProp: EntityContainer = {};
			if (store.images.find({ '@id': { $eq: imgId } })[0]) {
				objectProp[consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG] = store.images.find({ '@id': { $eq: imgId } })[0];
			} else {
				objectProp = entityMaker(
					consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG,
					consts.ONTOLOGY.ONT_IMAGE,
					imgId,
					`Supplemental Image for ${country}`);
				store.images.insert(objectProp[consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG]);
			}
			store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG, objectProp));

			const datatypeProp: { [key: string]: string|number } = {};
			datatypeProp[consts.ONTOLOGY.DT_LOCATOR_URI] = suppImgUrl;
			datatypeProp[consts.ONTOLOGY.DT_CONTENT_DESCRIPTION] = b || null;
			datatypeProp[consts.ONTOLOGY.DT_IMAGE_DIMENSIONS] = imageProps[0] || 'N/A';
			datatypeProp[consts.ONTOLOGY.DT_IMAGE_SIZE] = imageProps[1] || 'N/A';
			objectProp[consts.ONTOLOGY.HAS_SUPPLEMENTAL_IMG].datatypeProperties = datatypeProp;

			const pathSplit: string[] = suppImgUrl.split('/');
			const fileName: string = pathSplit[pathSplit.length - 1].split('?')[0].toLowerCase();
			datatypeProp[consts.ONTOLOGY.DT_MIME_TYPE] = fileName.split('.')[1];
			datatypeProp[consts.ONTOLOGY.DT_COLLECTION_TIMESTAMP] = (new Date()).toISOString();
			datatypeProp[consts.ONTOLOGY.DT_CONTENTS] = fileName;

			const options = {
				dest: `temp/images/${fileName}`,
				timeout: consts.BASE.DATA_REQUEST_TIMEOUT,
				url: suppImgUrl
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
	};
}
