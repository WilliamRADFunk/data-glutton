import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';

// Populate remaining airports from datahub list
export async function getPlanesOpenFlights(): Promise<void> {
    return new Promise((resolve, reject) => {
        let lineReader;
        try {
            lineReader = readline.createInterface({
                input: fs.createReadStream(path.join('assets', 'planes.dat'))
            });
        } catch(err) {
            store.errorLogger(`Failed to read planes.dat: ${err.message}`);
        }

        if (lineReader) {
            lineReader.on('close', () => {
                return resolve();
            });
            lineReader.on('line', (line) => {
                const lineItems = ((line && line.split(',')) || []).map(item => item && item.replace(/\"/g, ''));
                if (lineItems.length === 3) {
                    const name = lineItems[0].replace(/\\N/g, '').trim();
                    const iataCode = lineItems[1].replace(/\\N/g, '').trim();
                    const icaoCode = lineItems[2].replace(/\\N/g, '').trim();;

                    if (name && iataCode  && icaoCode) {
                        // Fetch or create aircraft type entity
                        const aircraftId = consts.ONTOLOGY.INST_AIRCRAFT_TYPE + getUuid.default(iataCode);
                        let acObjectProp: EntityContainer = {};
                        if (!store.aircraftTypes.find({ '@id': { $eq: aircraftId } })[0] ) {
                            acObjectProp = entityMaker(
                                consts.ONTOLOGY.HAS_AIRCRAFT_TYPE,
                                consts.ONTOLOGY.ONT_AIRCRAFT_TYPE,
                                aircraftId,
                                `${name}`);
                            acObjectProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE].datatypeProperties[consts.ONTOLOGY.DT_NAME_AIRCRAFT] = name;
                            acObjectProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE].datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = iataCode;
                            acObjectProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE].datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = icaoCode;
                            store.aircraftTypes.insert(acObjectProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE]);
                        }
                    }
                }
            });
        }
    });
}
