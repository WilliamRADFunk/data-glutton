import * as csv from 'csvtojson';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { RunwayOurairportsParamObject, RunwayOurairportsSourceObject } from '../../models/runway-ourairports-source-object';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

const materialLookupTable: { [key: string]: string } = {
    '\'CONCRETE\'': 'Concrete',
    'ALUM': 'ALUMINUM',
    'ALUMINUM': 'ALUMINUM',
    'ASB': 'Asbestos Cement',
    'ASFALT': 'Asphalt',
    'ASP': 'Asphalt',
    'ASPH': 'Asphalt',
    'ASPHALT': 'Asphalt',
    'ASPHALT CONCRETE': 'Concrete (Asphalt)',
    'ASPHALT MIX': 'Asphalt (Mix)',
    'ASPHALTIC CONCRETE': ' Concrete (Asphalt)',
    'BIT': 'Bituminous asphalt or tarmac',
    'BITUMEN': 'Bitumen',
    'BITUMINOUS': 'Bitumen',
    'BLACK CLAY': 'Clay (Black)',
    'BLACK SILT': 'Silt (Black)',
    'BRI': 'Bricks',
    'BRICK': 'Bricks',
    'BROWN CLAY': 'Clay (Brown)',
    'BROWN CLAY GRAVEL': 'Gravel (Brown Clay)',
    'BROWN GRAVEL': 'Gravel (Brown)',
    'BROWN SILT CLAY': 'Clay (Brown Silt)',
    'CALICHE': 'Cement (Caliche)',
    'CINDERS': 'Gravel (Cinders)',
    'CL': 'Clay',
    'CLA': 'Clay',
    'CLAY': 'Clay',
    'COM': 'Composite',
    'COMPACTED EARTH': 'Earth (Compacted)',
    'COMPACTED SCHIST': 'Schist (Compacted)',
    'CON': 'Concrete',
    'CONC': 'Concrete',
    'CONCRETE': 'Concrete',
    'COP': 'Composite',
    'COR': 'Coral (fine crushed coral reef structures)',
    'CORAL': 'Coral (fine crushed coral reef structures)',
    'CORAL SAND': 'Sand (Crushed Coral)',
    'CRUSHED ROCK': 'Crushed Rock',
    'CRUSHED STONE': 'Crushed Stone',
    'DECK': 'Deck',
    'DIRT': 'Dirt',
    'DIRT(CALICHE)': 'Dirt (Caliche)',
    'EARTH': 'Earth',
    'FROZEN LAKE': 'Ice (Frozen Lake)',
    'GRAAS': 'Grass',
    'GRADED EARTH': 'Earth (Graded)',
    'GRAIN': 'Grain',
    'GRAS': 'Grass',
    'GRASS': 'Grass',
    'GRASS CORAL': 'Coral (Grass)',
    'GRASS DIRT': 'Dirt (Grass)',
    'GRASS OR EARTH NOT GRADED OR ROLLED': 'Earth/Grass (Not Graded or rolled)',
    'GRASS RED SILTY CLAY': 'Clay (Grassed Red Silt)',
    'GRASS RED SILTY SAND': 'Sand (Grassed Red Silt)',
    'GRASSED BLACK CLAY': 'Clay (Grassed Black)',
    'GRASSED BLACK CLAY SAND': 'Sand (Grassed Black Clay)',
    'GRASSED BLACK CLAY SILT': 'Silt (Grassed Black Clay)',
    'GRASSED BLACK SAND': 'Sand (Grassed Black)',
    'GRASSED BLACK SILT': 'Silt (Grassed Black)',
    'GRASSED BLACK SILT CLAY': 'Clay (Grassed Black Silt)',
    'GRASSED BLACK SOIL': 'Soil (Grassed Black)',
    'GRASSED BLACKCLAY': 'Clay (Grassed Black)',
    'GRASSED BROWN CLAY': 'Clay (Grassed Brown)',
    'GRASSED BROWN CLAY GRAVEL': 'Gravel (Grassed Brown Clay)',
    'GRASSED BROWN GRAVEL': 'Gravel (Grassed Brown)',
    'GRASSED BROWN SANDY CLAY': 'Clay (Grassed Brown Sandy)',
    'GRASSED BROWN SILT CLAY': 'Clay (Grassed Brown Silt)',
    'GRASSED BROWN SILT LOAM': 'Loam (Grassed Brown Silt)',
    'GRASSED BROWN SILTY CLAY': 'Clay (Grassed Brown Silt)',
    'GRASSED CLAY': 'Clay (Grassed)',
    'GRASSED CLAY SILT CLAY': 'Clay (Grassed Silt)',
    'GRASSED GRAVEL': 'Gravel (Grassed)',
    'GRASSED GREY CLAY': 'Clay (Grassed Grey)',
    'GRASSED GREY GRAVEL': 'Gravel (Grassed Grey)',
    'GRASSED GREY SAND': 'Sand (Grassed Grey)',
    'GRASSED GREY SILT CLAY': 'Clay (Grassed Grey Silt)',
    'GRASSED GREY SILT SAND': 'Sand (Grassed Grey Silt)',
    'GRASSED LIMESTONE GRAVEL': 'Gravel (Grassed Limestone)',
    'GRASSED RED CLAY': 'Clay (Grassed Red)',
    'GRASSED RED CLAY GRAVEL': 'Gravel (Grassed Red Clay)',
    'GRASSED RED SILT': 'Silt (Grassed Red)',
    'GRASSED RED SILT CLAY': 'Clay (Grassed Red Silt)',
    'GRASSED RED SILT SAND': 'Sand (Grassed Red Silt)',
    'GRASSED RED SILTY CLAY': 'Clay (Grassed Red Silt)',
    'GRASSED RED SILTY SAND': 'Sand (Grassed Red Silt)',
    'GRASSED RIVER GRAVEL': 'Gravel (Grassed Gravel)',
    'GRASSED SAND': 'Sand (Grassed)',
    'GRASSED SANDY LOAM': 'Loam (Grassed sandy)',
    'GRASSED SILT CLAY': 'Clay (Grassed Silt)',
    'GRASSED WHITE CORONAS': 'Grass (White Coronas)',
    'GRASSED WHITE GRAVEL': 'Gravel (Grassed White)',
    'GRASSED WHITE LIME STONE': 'Limestone (Grassed White)',
    'GRASSED YELLOW CLAY': 'Clay (Grassed Yellow)',
    'GRASSED YELLOW GRAVEL': 'Gravel (Grassed Yellow)',
    'GRASSED YELLOW SILT CLAY': 'Clay (Grassed Yellow Silt)',
    'GRASSY': 'Grass',
    'GRAV': 'Gravel',
    'GRAVEL': 'Gravel',
    'GRE': 'Earth/Grass (Graded or rolled)',
    'GREY CLAY': 'Clay (Grey)',
    'GREY GRAVEL': 'Gravel (Grey)',
    'GREY SILT CLAY': 'Clay (Grey Silt)',
    'GROUND': 'Earth',
    'GRS': 'Grass',
    'GRV': 'Gravel',
    'GRVL': 'Gravel',
    'GVL': 'Gravel',
    'HARD CLAY': 'Clay (Hard)',
    'HARD GRAVEL': 'Gravel (Hard)',
    'HARD LOAM': 'Loam (Hard)',
    'HARD MUD': 'Mud (Hard)',
    'HARD SAND': 'Sand (HARD)',
    'ICE': 'Ice',
    'LANDING MATS': 'Marston Matting',
    'LAT': 'Laterite',
    'LIMESTONE': 'Limestone',
    'LOOSE GRAVEL': 'Gravel (Loose)',
    'MAC': 'Macadam',
    'MAICILLO': 'Sand (Maicillo)',
    'MARSTON MATTING': 'Marston Matting',
    'MAT': 'Marston Matting',
    'MATS': 'Marston Matting',
    'MEMBRANES': 'Marston Matting',
    'MET': 'Metal',
    'METAL': 'Metal',
    'MOSS': 'Earth (Moss)',
    'NATURAL SOIL': 'Natural Soil',
    'NEOPRENE': 'Neoprene',
    'OILED DIRT': 'Dirt (Oiled)',
    'OILED GRAVEL': 'Gravel (Oiled)',
    'OILGRAVEL': 'Gravel (Oiled)',
    'OLD ASP': 'Asphalt (Old)',
    'OLIGRAVEL': 'Gravel (Oiled)',
    'PACKED': 'Dirt (Packed)',
    'PACKED DIRT': 'Dirt (Packed)',
    'PACKED GRAVEL': 'Gravel (Packed)',
    'PAD': 'Blast Pads',
    'PAVED': 'Pavement',
    'PAVEMENT': 'Pavement',
    'PEM': 'Partially concrete, asphalt or bitumen-bound macadam',
    'PER': 'Permanent surface, details unknown',
    'PFC': 'Porous Friction Course',
    'PIERCED STEEL PLANKING': 'Marston Matting',
    'PSP': 'Marston Matting',
    'RED CLAY': 'Clay (Red)',
    'RED CLAY GRAVEL': 'Gravel (Red Clay)',
    'RED GRAVEL': 'Gravel (Red)',
    'RED SILT CLAY': 'Clay (Red Silt)',
    'ROCK': 'Rock',
    'ROCKY GRAVEL': 'Gravel (Rocky)',
    'ROLLED EARTH': 'Earth (Rolled)',
    'ROOF': 'Rooftop',
    'ROOF-TOP': 'Rooftop',
    'ROOF/TOP': 'Rooftop',
    'ROOFTOP': 'Rooftop',
    'SA': 'Sand',
    'SAN': 'Sand',
    'SAND': 'Sand',
    'SAND GRASS': 'Sand (Grass)',
    'SANDY GRAVEL': 'Gravel (Sandy)',
    'SANDY SOIL': 'Soil (Sandy)',
    'SHELLS': 'Shells',
    'SLAG': 'Slag',
    'SMT': 'Sommerfeld Tracking',
    'SN': 'Sand',
    'SNO': 'Snow',
    'SNOW': 'Snow',
    'SOD': 'Sod',
    'SOFT GRAVEL': 'Gravel (Soft)',
    'SOFT SAND': 'Sand (Soft)',
    'SOIL': 'Soil',
    'STEEL': 'Steel',
    'STONE': 'Stone',
    'STONE DUST': 'Stone (Dust)',
    'TAR': 'Tar',
    'TARMAC': 'Tarmac',
    'TOP': 'Rooftop',
    'TREATED': 'Treated',
    'TREATED GRAVEL': 'Gravel (Treated)',
    'TREATED SAND': 'Sand (Treated)',
    'TRTD': 'Treated',
    'TRTD GRVL': 'Gravel (Treated)',
    'TURF': 'Turf',
    'U': 'Unknown',
    'UNK': 'Unknown',
    'UNKNOWN': 'Unknown',
    'UNPAVED': 'Unknown (Unpaved)',
    'WATER': 'Water',
    'WHITE GRAVEL': 'Gravel (White)',
    'WOOD': 'Wood',
    'YELLOW GRAVEL': 'Gravel (Yellow)',
};
const conditionLookupTable: {[key: string]: string} = {
    'F': 'Fair',
    'G': 'Good',
    'P': 'Poor',
    'f': 'Fair',
    'g': 'Good',
    'p': 'Poor'
};

export async function getRunwaysFromOurAirports(): Promise<void> {
    const runwayData: RunwayOurairportsSourceObject[] = [];

    const jsonifiedData = await csv({
        headers: ['id','refId', 'ident', 'length', 'width', 'surfMat', 'lighted', 'closed'],
        noheader: false
    }).fromFile('src/assets/runways-ourairports.csv');

    jsonifiedData.forEach((datum: RunwayOurairportsParamObject) => runwayData.push(CSV(
        datum.id,
        datum.refId,
        datum.ident,
        datum.length,
        datum.width,
        datum.surfMat,
        datum.lighted,
        datum.closed
    )));
    
	Object.values(runwayData).forEach(runway => {
        if (!runway.length || !runway.width || !runway.ident) {
            return;
        }
        const airportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(runway.ident);
        const airport = store.airports.find({ '@id': { $eq: airportId } })[0];
        // If an airport doesn't already exist in the store for this runway,
        // we can't attach the runway to anything.
        if (airport && runway.length && runway.width) {
            const airportObjProperties = airport.objectProperties;
            let runMap = getRelation(airportObjProperties, consts.ONTOLOGY.HAS_RUNWAY);
            const rId = consts.ONTOLOGY.INST_RUNWAY + getUuid.default(runway.ident);
            if (!runMap) {
                let objectProp: EntityContainer = {};
                if (store.runways.find({ '@id': { $eq: rId } })[0]) {
                    objectProp[consts.ONTOLOGY.HAS_RUNWAY] = store.runways.find({ '@id': { $eq: rId } })[0];
                } else {
                    objectProp = entityMaker(
                        consts.ONTOLOGY.HAS_RUNWAY,
                        consts.ONTOLOGY.ONT_RUNWAY,
                        rId,
                        `Runway for ${airport.datatypeProperties[consts.ONTOLOGY.DT_NAME] || runway.ident}`);
                    store.runways.insert(objectProp[consts.ONTOLOGY.HAS_RUNWAY]);
                }
                runMap = objectProp[consts.ONTOLOGY.HAS_RUNWAY];
                airport.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_RUNWAY, objectProp));
            }
            runMap.datatypeProperties[consts.ONTOLOGY.DT_LENGTH] = Number(runway.length);
            runMap.datatypeProperties[consts.ONTOLOGY.DT_WIDTH] =  Number(runway.width);
            runMap.datatypeProperties[consts.ONTOLOGY.DT_UNIT] = 'ft';
            
            if (runway.surfMat) {
                runway.surfMat = runway.surfMat.replace(',', ' - ');
                // Catches edge case where single letters specifiy condition of the runway material.
                // (-|/| over | with | and |&amp;|&)
                const hyphenList = runway.surfMat
                    .split(new RegExp('[-|/|&]| over | with | and |amp;', 'gi'))
                    .filter(sm => !!sm)
                    .map(sm => sm.trim())
                    .filter(sm => !!sm);
                const lastDescriptor = hyphenList[hyphenList.length - 1];
                const hasCondition = (lastDescriptor && lastDescriptor.length === 1) || null;
                let condition = '';
                if (hasCondition) {
                    condition = conditionLookupTable[lastDescriptor];
                }
                // Ensure synonyms of same material aren't counted as extra
                let surfaceMaterials: string[] = hyphenList;
                let convertedSurList: string[] = []; 
                if (!hasCondition) {
                    surfaceMaterials.forEach(mat => {
                        convertedSurList.push(materialLookup(mat));
                    });
                    convertedSurList = convertedSurList.filter(x => !!x);
                    // Remove undefined, and duplications
                    const fistSurf = convertedSurList.shift();
                    if (fistSurf) {
                        convertedSurList = convertedSurList.filter(x => x !== fistSurf);
                        convertedSurList.unshift(fistSurf);
                    }
                }

                if (!convertedSurList.length) {
                    return;
                }
                
                if (convertedSurList[0] === 'ROOF' || convertedSurList.length === 1) {
                    makeSurfaceMaterial(airport, runMap, runway.ident, materialLookup(runway.surfMat), false, condition);
                } else {
                    convertedSurList.forEach(mat => {
                        makeSurfaceMaterial(airport, runMap, runway.ident, mat, true);
                    });
                }
            }
        }
	});
};

function makeSurfaceMaterial(
    airport: Entity,
    runMap: Entity,
    runwayId: string,
    sMat: string,
    isComposite: boolean,
    condition?: string
) {
    if (!sMat) {
        return;
    }
    const runwayObjProperties = runMap.objectProperties;
    let mapSurfMat = getRelation(runwayObjProperties, consts.ONTOLOGY.HAS_SURFACE_MATERIAL);
    const smId = consts.ONTOLOGY.INST_SURFACE_MATERIAL + getUuid.default(runwayId) + getUuid.default(sMat);
    if (!mapSurfMat) {
        let surfMatObjProp: EntityContainer = {};
        if (store.surfaceMaterials.find({ '@id': { $eq: smId } })[0]) {
            surfMatObjProp[consts.ONTOLOGY.HAS_SURFACE_MATERIAL] = store.surfaceMaterials.find({ '@id': { $eq: smId } })[0];
        } else {
            surfMatObjProp = entityMaker(
                consts.ONTOLOGY.HAS_SURFACE_MATERIAL,
                consts.ONTOLOGY.ONT_SURFACE_MATERIAL,
                smId,
                `Surface Material for the runway at ${airport.name || runwayId}`);
            store.surfaceMaterials.insert(surfMatObjProp[consts.ONTOLOGY.HAS_SURFACE_MATERIAL]);
        }
        mapSurfMat = surfMatObjProp[consts.ONTOLOGY.HAS_SURFACE_MATERIAL];
        runMap.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_SURFACE_MATERIAL, surfMatObjProp));
    }
    if (condition) {
        mapSurfMat.datatypeProperties[consts.ONTOLOGY.DT_CONDITION] = condition;
    }
    mapSurfMat.datatypeProperties[consts.ONTOLOGY.DT_IS_COMPOSITE] = isComposite;
    mapSurfMat.datatypeProperties[consts.ONTOLOGY.DT_MATERIAL] = sMat;
}

function materialLookup(abbrev: string): string {
    // if (!materialLookupTable[abbrev.toUpperCase()]) {
    //     store.debugLogger(`3, ${abbrev} ~ ${materialLookupTable[abbrev.toUpperCase()]}`);
    // }
    return materialLookupTable[abbrev.toUpperCase()] || abbrev || '';
}

function CSV(
    id: number,
    refId: number,
    ident: string,
    length: number,
    width: number,
    surfMat: string,
    lighted: number,
    closed: number
) {
    return {
        closed: !!closed,
        id,
        ident,
        length,
        lighted: !!lighted,
        refId,
        surfMat,
        width
    };
}; 