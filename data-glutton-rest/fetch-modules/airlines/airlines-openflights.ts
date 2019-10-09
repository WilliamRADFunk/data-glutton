import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { Entity } from '../../models/entity';
import { EntityContainer } from '../../models/entity-container';
import { airportDatahubList, isoCodeToDataCode } from '../../utils/country-code-lookup-tables';
import { countryToId } from '../../utils/country-to-id';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

// Populate remaining airports from datahub list
export function getAirlineOpenFlights(): void {
	let lineReader;
	try {
		lineReader = readline.createInterface({
			input: fs.createReadStream(path.join('assets', 'airline-openflights.dat'))
		});
	} catch(err) {
		store.errorLogger(`Failed to read airline-openflights.dat: ${err.message}`);
	}
	
	if (lineReader) {
		lineReader.on('line', (line) => {
			const lineItems = (line && line.split(',')) || [];
			if (lineItems.length === 8) {
				lineItems.shift();
				const name = lineItems[0];
				const alias = lineItems[1];
				const iata = lineItems[2];
				const icao = lineItems[3];
				const callsign = lineItems[4];
				const country = lineItems[5];
				const active = lineItems[6];

				store.debugLogger(`Line from file: ${name}, ${alias}, ${iata}, ${icao}, ${callsign}, ${country}, ${active}`);
			}
		});
	}
}
