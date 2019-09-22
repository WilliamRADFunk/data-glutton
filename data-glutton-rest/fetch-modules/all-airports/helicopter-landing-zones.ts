import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getHelicopterLandingZones(): void {
	const totalItems = store.airports.count();
	let lastPercentageEmitted = 0;
    Object.values(store.airports).forEach((airport: Entity, index: number) => {
		if (lastPercentageEmitted !== Math.floor((index / totalItems) * 100)) {
			store.progressLogger('HelicopterLandingZones', index / totalItems);
			lastPercentageEmitted = Math.floor((index / totalItems) * 100);
		}
        let location: Entity = getRelation(airport.objectProperties, consts.ONTOLOGY.HAS_LOCATION);
        location = store.locations.find({ '@id': { $eq: [location && location['@id']] } })[0];
        let runway: Entity = getRelation(airport.objectProperties, consts.ONTOLOGY.HAS_RUNWAY);
        runway = store.runways.find({ '@id': { $eq: [runway && runway['@id']] } })[0];
        // No location, no way to land on the spot.
        // No runway, no place to get length, width, and surface materials from.
        if (!location || !runway) {
            return;
        }

        const surfaceMats: Entity[] = airport.objectProperties
            .filter((x: EntityContainer) => x[consts.ONTOLOGY.HAS_SURFACE_MATERIAL])
            .map((y: EntityContainer) => y[consts.ONTOLOGY.HAS_SURFACE_MATERIAL])
            .map((z: EntityContainer) => store.surfaceMaterials.find({ '@id': { $eq: [z && z['@id']] } })[0]);

        const latLng = location.datatypeProperties[consts.WGS84_POS.LAT_LONG];
        const length =  runway.datatypeProperties[consts.ONTOLOGY.DT_LENGTH];
        const width =  runway.datatypeProperties[consts.ONTOLOGY.DT_WIDTH];
        const unit =  runway.datatypeProperties[consts.ONTOLOGY.DT_UNIT];
        // Without a location, a width, a length, and a minimum size (80 ft width),
        // There is nothing to make a Helicopter Landing Zone out of.
        if (!latLng || !length || !width || !Math.floor(width / 80)) {
            return;
        }

        const hlzId = consts.ONTOLOGY.INST_HELO_LAND_ZONE + getUuid.default(latLng);
        let objectProp: EntityContainer = {};

        if (!store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0]) {
            objectProp = entityMaker(
                consts.ONTOLOGY.HAS_HELO_LAND_ZONE,
                consts.ONTOLOGY.ONT_HELO_LAND_ZONE,
                hlzId,
                `Helicopter Landing Zone on runway of airport: ${
                    airport.datatypeProperties[consts.ONTOLOGY.DT_NAME] ||
                    airport.datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] ||
                    'N/A'
                }`);
            
            store.helicopterLandingZones.insert(objectProp[consts.ONTOLOGY.HAS_HELO_LAND_ZONE]);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_LENGTH] = length;
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_WIDTH] = width;
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_LOCATION, store.locations, location['@id']));
            surfaceMats.forEach(sm => {
                store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_SURFACE_MATERIAL, store.surfaceMaterials, sm['@id']));
            });
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_1] = getNumOfLPS(length, width, 1);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_2] = getNumOfLPS(length, width, 2);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_3] = getNumOfLPS(length, width, 3);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_4] = getNumOfLPS(length, width, 4);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_5] = getNumOfLPS(length, width, 5);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_6] = getNumOfLPS(length, width, 6);
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_NUM_OF_LAND_SITE_7] = getNumOfLPS(length, width, 7);
            
            store.helicopterLandingZones.find({ '@id': { $eq: hlzId } })[0].datatypeProperties[consts.ONTOLOGY.DT_UNIT] = unit || 'ft (Guessed Unit)';
        }
    });
};

function getNumOfLPS(length: number, width: number, size: number): number {
    const lengthInMeters = 0.3048 * length;
    const widthInMeters = 0.3048 * width;
    let minBase;
    let numInWidth: number = 0;
    let numInLength: number = 0;
    switch(size) {
        case 1: {
            minBase = 25;
            break;
        }
        case 2: {
            minBase = 35;
            break
        }
        case 3: {
            minBase = 50;
            break
        }
        case 4: {
            minBase = 80;
            break
        }
        case 5: {
            minBase = 100;
            break
        }
        case 6: {
            minBase = 125;
            break
        }
        case 7: {
            minBase = 150;
            break
        }
    }
    
    numInLength = Math.floor(lengthInMeters / minBase);
    numInWidth = Math.floor(widthInMeters / minBase);
    return numInWidth * numInLength;
}