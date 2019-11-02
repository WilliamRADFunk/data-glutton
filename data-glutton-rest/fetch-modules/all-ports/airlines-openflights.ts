import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import rp from 'request-promise-native';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { countryNameToIsoCode, isoCodeToDataCode } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

function parseData(dataString: string): Promise<void> {
	return new Promise((res, rej) => {
		let lineReader;
		try {
			lineReader = readline.createInterface({
				input: fs.createReadStream(dataString)
			});
		} catch(err) {
			store.errorLogger(`Failed to read airline-openflights.dat: ${err.message}`);
		}

		if (lineReader) {
			lineReader.on('close', () => {
				return res();
			});
			lineReader.on('line', (line) => {
				const lineItems = ((line && line.split(',')) || []).map(item => item && item.replace(/\"/g, ''));
				if (lineItems.length === 8) {
					const openFlightsId = lineItems[0]
					const name = lineItems[1];
					const alias = lineItems[2];
					const iata = lineItems[3];
					const icao = lineItems[4];
					const callsign = lineItems[5];
					const country = lineItems[6];
					const active = lineItems[7];

					// Fetch or create airline entity
					const airlineId = consts.ONTOLOGY.INST_AIRLINE + getUuid.default(openFlightsId);
					let airlineObjectProp: EntityContainer = {};
					if (store.airlines.find({ '@id': { $eq: airlineId } })[0] ) {
						airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE] = store.airlines.find({ '@id': { $eq: airlineId } })[0];
					} else {
						airlineObjectProp = entityMaker(
							consts.ONTOLOGY.HAS_AIRLINE,
							consts.ONTOLOGY.ONT_AIRLINE,
							airlineId,
							`The Airline of ${name} (${country})`);
						if (alias && alias !== '\\N' && alias !== 'null') {
							airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].datatypeProperties[consts.ONTOLOGY.DT_ALIAS] = alias;
						}
						if (iata && iata !== '\\N') {
							airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].datatypeProperties[consts.ONTOLOGY.DT_IATA_CODE] = iata;
						}
						if (icao && icao !== '\\N') {
							airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].datatypeProperties[consts.ONTOLOGY.DT_ICAO_CODE] = icao;
						}
						if (callsign && callsign !== '\\N') {
							airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].datatypeProperties[consts.ONTOLOGY.DT_CALLSIGN] = callsign;
						}
						if (active) {
							airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].datatypeProperties[consts.ONTOLOGY.DT_STATUS_AIRLINE] = active.toLowerCase() === 'y' ? 'Open' : 'Closed';
						}
						if (country && countryNameToIsoCode(country)) {
							const countryId = countryToId(isoCodeToDataCode(countryNameToIsoCode(country))) || '';
							const countryRef = store.countries.find({ '@id': { $eq: countryId } })[0];
							if (countryRef) {
								airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE].objectProperties.push(
									entityRefMaker(
										consts.ONTOLOGY.HAS_COUNTRY,
										store.countries,
										countryId
								));
								store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_AIRLINE, airlineObjectProp));
							}
						}
						store.airlines.insert(airlineObjectProp[consts.ONTOLOGY.HAS_AIRLINE]);
					}
				}
			});
		}
	});
}

// Populate remaining airports from datahub list
export async function getAirlineOpenFlights(): Promise<void> {
    return new Promise((resolve, reject) => {
		const url = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat';
		rp(url, { timeout: consts.BASE.DATA_REQUEST_TIMEOUT })
			.then(results => {
				try {
					fs.writeFileSync(path.join('assets', 'airline-openflights-updated.dat'), results);
					parseData(path.join('assets', 'airline-openflights-updated.dat'))
						.then(done => {
							resolve();
						});
				} catch(err) {
					store.errorLogger(`Filed to fetch airlines from ${url}. Falling back to local copy. ${err}`);
					parseData(path.join('assets', 'airline-openflights.dat'))
						.then(done => {
							resolve();
						});
				};
			})
			.catch(err => {
				store.errorLogger(`Filed to fetch airlines from ${url}. Falling back to local copy. ${err}`);
				parseData(path.join('assets', 'airline-openflights.dat'))
					.then(done => {
						resolve();
					});
			});
	});
}
