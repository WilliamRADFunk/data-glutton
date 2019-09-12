import * as getUuid from "uuid-by-string";

import { consts } from "../../constants/constants";
import { store } from "../../constants/globalStore";
import { entityMaker } from "../../utils/entity-maker";
import { entityRefMaker } from "../../utils/entity-ref-maker";
import { getRelation } from "../../utils/get-relations";
import { EntityContainer } from "../../models/entity-container";

export function getRegionMapImg(cheerioElem: CheerioSelector, country: string, countryId: string) {
    const objectProperties = store.getObjectStore("countries")[countryId].objectProperties;
    cheerioElem("div.mapBox").each((index: number, element: CheerioElement) => {
        let map = getRelation(objectProperties, consts.ONTOLOGY.HAS_REGION_MAP);
        const rmId = consts.ONTOLOGY.INST_REGION_MAP + getUuid.default(country);
        let objectProp: EntityContainer = {};
        objectProp[consts.ONTOLOGY.HAS_REGION_MAP] = map;
        if (!map) {
            if (store.getObjectStore("regionMaps")[rmId]) {
                objectProp[consts.ONTOLOGY.HAS_REGION_MAP] = store.getObjectStore("regionMaps")[rmId];
            } else {
                objectProp = entityMaker(
                    consts.ONTOLOGY.HAS_REGION_MAP,
                    consts.ONTOLOGY.ONT_REGION_MAP,
                    rmId,
                    `Region Map for ${country}`);
            }
            map = objectProp[consts.ONTOLOGY.HAS_REGION_MAP];
        }
        const a = cheerioElem(element).find("img").attr("src");
        let regionMapImgUrl;
        if (a && a.replace("../", "")) {
            regionMapImgUrl = consts.BASE.URL_BASE_FACTBOOK + a.replace("../", "");
            if (regionMapImgUrl && !regionMapImgUrl.includes("locator-map")) {
                const datatypeProp: { [key: string]: string|number } = {};
                datatypeProp[consts.ONTOLOGY.DT_LOCATOR_URI] = regionMapImgUrl;
                map.datatypeProperties = datatypeProp;
                store.getObjectStore("regionMaps")[rmId] = map;
                store.getObjectStore("countries")[countryId].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_REGION_MAP, objectProp));
            }
        }
        // TODO: scrape physical image from url and store it.
    });
}
