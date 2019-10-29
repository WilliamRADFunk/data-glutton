import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import rp from 'request-promise-native';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';

function parseData(dataString: string): Promise<void> {
	return new Promise((res, rej) => {
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
                return res();
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
        } else {
            return res();
        }
	});
}

// Populate remaining airports from datahub list
export async function getPlanesOpenFlights(): Promise<void> {
    return new Promise((resolve, reject) => {
        const url = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/planes.dat';
		rp(url, { timeout: consts.BASE.DATA_REQUEST_TIMEOUT })
			.then(results => {
				try {
					fs.writeFileSync(path.join('assets', 'planes-openflights-updated.dat'), results);
					parseData(path.join('assets', 'planes-openflights-updated.dat'))
                        .then(done => {
                            resolve();
                        });
				} catch(err) {
					store.errorLogger(`Filed to fetch planes from ${url}. Falling back to local copy. ${err}`);
					parseData(path.join('assets', 'planes-openflights.dat'))
                        .then(done => {
                            resolve();
                        });
				};
			})
			.catch(err => {
				store.errorLogger(`Filed to fetch planes from ${url}. Falling back to local copy. ${err}`);
				parseData(path.join('assets', 'planes-openflights.dat'))
                    .then(done => {
                        resolve();
                    });
			});
    });
}
