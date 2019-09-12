import * as getUuid from "uuid-by-string";

import { consts } from "../../constants/constants";
import { store } from "../../constants/globalStore";
import { entityMaker } from "../../utils/entity-maker";
import { entityRefMaker } from "../../utils/entity-ref-maker";
import { EntityContainer } from "../../models/entity-container";
import { Entity } from "../../models/entity";

function parseSingleLocation(cheerio: Cheerio, country: string, countryId: string) {
	const content = cheerio.find("div.category_data.subfield.text").text().trim();
	store.getObjectStore("countries")[countryId].datatypeProperties[consts.ONTOLOGY.DT_LOCATION_REF_DESCRIPTION] = content;

	const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(country);
	let objectProp: EntityContainer = {};
	if (store.getObjectStore("locations")[geoId]) {
		objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.getObjectStore("locations")[geoId];
	} else {
		objectProp = entityMaker(
			consts.ONTOLOGY.HAS_LOCATION,
			consts.ONTOLOGY.ONT_GEO_LOCATION,
			geoId,
			`Geographic Location for ${country}`);
		store.getObjectStore("locations")[geoId] = objectProp[consts.ONTOLOGY.HAS_LOCATION];

		const datatypeProp: { [key: string]: string|number } = {};
		datatypeProp[consts.ONTOLOGY.DT_LOCATION_DESCRIPTION] = content;
		objectProp[consts.ONTOLOGY.HAS_LOCATION].datatypeProperties = datatypeProp;
	}
	store.getObjectStore("countries")[countryId].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
}

function parseMultipleLocations(cheerioElem: CheerioSelector, country: string, countryId: string, scope: CheerioElement) {
	cheerioElem(scope).find("p").each((index: number, element: CheerioElement) => {
		const content = cheerioElem(element).text().trim();
		const strongTag = cheerioElem(element).find("strong").text().trim().slice(0, -1);
		const locations = store.getObjectStore("countries")[countryId].objectProperties
			.filter((objProp: EntityContainer) => objProp[consts.ONTOLOGY.HAS_LOCATION])
			.map((objProp: EntityContainer) => objProp[consts.ONTOLOGY.HAS_LOCATION]);
  let objectProp: EntityContainer = {};
		if (!strongTag) {
			const description = content.substring(0, content.indexOf(strongTag)).trim();
			store.getObjectStore("countries")[countryId].datatypeProperties[consts.ONTOLOGY.DT_LOCATION_REF_DESCRIPTION] = description;
		} else {
		    const geoId = consts.ONTOLOGY.INST_GEO_LOCATION + getUuid.default(country) + getUuid.default(strongTag);
			   let geoAttr = locations.find((loc: Entity) => loc && loc["@id"] === geoId);
			   if (!geoAttr) {
				if (store.getObjectStore("locations")[geoId]) {
					objectProp[consts.ONTOLOGY.HAS_LOCATION] = store.getObjectStore("locations")[geoId];
				} else {
					objectProp = entityMaker(
						consts.ONTOLOGY.HAS_LOCATION,
						consts.ONTOLOGY.ONT_GEO_LOCATION,
						geoId,
						`Geographic Location for ${country} - ${strongTag}`);
					store.getObjectStore("locations")[geoId] = objectProp[consts.ONTOLOGY.HAS_LOCATION];

					const datatypeProp: { [key: string]: string|number } = {};
					datatypeProp[consts.ONTOLOGY.DT_LOCATION_DESCRIPTION] = content;
					objectProp[consts.ONTOLOGY.HAS_LOCATION].datatypeProperties = datatypeProp;
				}
				geoAttr = objectProp[consts.ONTOLOGY.HAS_LOCATION];
				store.getObjectStore("countries")[countryId].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, objectProp));
			}
		}
	});
}

export function getGeography(cheerioElem: CheerioSelector, country: string, countryId: string) {
	cheerioElem("#field-location").each((index: number, element: CheerioElement) => {
		const hasMultLocations = cheerioElem(element).find("div.category_data.subfield.text > p");
		// Multiple p tags suggests the nation has multiple locations in different parts of the world.
		// This means distinct description and geographic coordinates. Each must be handled separately.
  if (hasMultLocations.length) {
			parseMultipleLocations(cheerioElem, country, countryId, element);
        } else {
			parseSingleLocation(cheerioElem(element), country, countryId);
		}
	});
	cheerioElem("#field-map-references").each((index: number, element: CheerioElement) => {
        const mapRef = cheerioElem(element).find("div.category_data.subfield.text").text().trim();
        if (mapRef) {
            store.getObjectStore("countries")[countryId].datatypeProperties[consts.ONTOLOGY.DT_MAP_REFERENCES] = mapRef;
        }
	});
}
