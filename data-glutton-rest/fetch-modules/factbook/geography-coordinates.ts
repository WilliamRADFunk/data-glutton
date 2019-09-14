import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

function parseSingleCoordinates(cheerio: Cheerio, country: string, countryId: string) {
	const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(country);
	const locations = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties
		.filter((objProp: EntityContainer) => objProp[consts.ONTOLOGY.HAS_LOCATION]);
	const foundEntityContainer = locations.find((loc: EntityContainer) => loc && loc[consts.ONTOLOGY.HAS_LOCATION]['@id'] === geoId);
	let geoAttr = foundEntityContainer && foundEntityContainer[consts.ONTOLOGY.HAS_LOCATION];
	const content = cheerio.find('div.category_data.subfield.text').text().trim();

	let objectProp: EntityContainer = {};
	if (!geoAttr) {
		if (store.locations.find({ '@id': { $eq: geoId } })[0]) {
			objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.locations.find({ '@id': { $eq: geoId } })[0];
		} else {
			objectProp = entityMaker(
				consts.ONTOLOGY.HAS_LOCATION,
				consts.ONTOLOGY.ONT_GEO_LOCATION,
				geoId,
				`Geographic Location for ${country}`);
			store.locations.insert(objectProp[consts.ONTOLOGY.HAS_LOCATION]);
		}
		geoAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
		store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
	} else {
		geoAttr = store.locations.find({ '@id': { $eq: geoId } })[0];
	}

	if (content) {
		const coords = content.split(',');
		const latSplit = coords[0].trim().split(' ');
		const lat = (latSplit[latSplit.length - 1].includes('S') ? -1 : 1) * Number(latSplit[0].trim() + '.' + latSplit[1].trim());
		const lngSplit = coords[1].trim().split(' ');
		const lng = (lngSplit[lngSplit.length - 1].includes('W') ? -1 : 1) * Number(lngSplit[0].trim() + '.' + lngSplit[1].trim());

		const datatypeProp: { [key: string]: string|number } = {};
		if (geoAttr.datatypeProperties) {
			geoAttr.datatypeProperties[consts.WGS84_POS.LAT] = lat;
			geoAttr.datatypeProperties[consts.WGS84_POS.LONG] = lng;
			geoAttr.datatypeProperties[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
		} else {
			datatypeProp[consts.WGS84_POS.LAT] = lat;
			datatypeProp[consts.WGS84_POS.LONG] = lng;
			datatypeProp[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
			geoAttr.datatypeProperties = datatypeProp;
		}
	}
}

function parseMultipleCoordinates(cheerioElem: CheerioSelector, country: string, countryId: string, scope: CheerioElement) {
	cheerioElem(scope).find('p').each((index: number, element: CheerioElement) => {
		const content = cheerioElem(element).text().trim().split(':')[1];
		const strongTag = cheerioElem(element).find('strong').text().trim().slice(0, -1);
		const locations = store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties
			.filter((objProp: EntityContainer) => objProp[consts.ONTOLOGY.HAS_LOCATION])
			.map((objProp: EntityContainer) => objProp[consts.ONTOLOGY.HAS_LOCATION]);
		let objectProp: EntityContainer = {};

		if (strongTag) {
			const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(country) + getUuid.default(strongTag);
			let geoAttr = locations.find((loc: Entity) => loc && loc['@id'] === geoId);
			if (!geoAttr) {
				if (store.locations.find({ '@id': { $eq: geoId } })[0]) {
					objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.locations.find({ '@id': { $eq: geoId } })[0];
				} else {
					objectProp = entityMaker(
						consts.ONTOLOGY.HAS_LOCATION,
						consts.ONTOLOGY.ONT_GEO_LOCATION,
						geoId,
						`Geographic Location for ${country} - ${strongTag}`);
					store.locations.insert(objectProp[consts.ONTOLOGY.HAS_LOCATION]);
				}
				geoAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
				store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
			} else {
				geoAttr = store.locations.find({ '@id': { $eq: geoId } })[0];
			}

			if (content) {
				const coords = content.split(',');
				const latSplit = coords[0].trim().split(' ');
				const lat = (latSplit[latSplit.length - 1].includes('S') ? -1 : 1) * Number(latSplit[0].trim() + '.' + latSplit[1].trim());
				const lngSplit = coords[1].trim().split(' ');
				const lng = (lngSplit[lngSplit.length - 1].includes('W') ? -1 : 1) * Number(lngSplit[0].trim() + '.' + lngSplit[1].trim());

				const datatypeProp: { [key: string]: string|number } = {};
				if (geoAttr && geoAttr.datatypeProperties) {
					geoAttr.datatypeProperties[consts.WGS84_POS.LAT] = lat;
					geoAttr.datatypeProperties[consts.WGS84_POS.LONG] = lng;
					geoAttr.datatypeProperties[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
				} else {
					datatypeProp[consts.WGS84_POS.LAT] = lat;
					datatypeProp[consts.WGS84_POS.LONG] = lng;
					datatypeProp[consts.WGS84_POS.LAT_LONG] = `${lat}, ${lng}`;
					geoAttr.datatypeProperties = datatypeProp;
				}
			}
		}
	});
}

export function getGeographyCoordinates(cheerioElem: CheerioSelector, country: string, countryId: string) {
	cheerioElem('#field-geographic-coordinates').each((index: number, element: CheerioElement) => {
		const hasMultLocations = cheerioElem(element).find('div.category_data.subfield.text > p');
		// Multiple p tags suggests the nation has multiple locations in different parts of the world.
		// This means distinct description and geographic coordinates. Each must be handled separately.
		if (hasMultLocations.length) {
			parseMultipleCoordinates(cheerioElem, country, countryId, element);
		} else {
			parseSingleCoordinates(cheerioElem(element), country, countryId);
		}
		return;
	});
}
