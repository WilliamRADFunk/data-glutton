import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

// Populate remaining airports from datahub list
export function getRoutesOpenFlights(): void {
	let lineReader;
	try {
		lineReader = readline.createInterface({
			input: fs.createReadStream(path.join('assets', 'routes.dat'))
		});
	} catch(err) {
		store.errorLogger(`Failed to read routes.dat: ${err.message}`);
	}
	
	if (lineReader) {
		lineReader.on('line', (line) => {
			const lineItems = ((line && line.split(',')) || []).map(item => item && item.replace(/\"/g, ''));
			if (lineItems.length === 8) {
                const airlineIataORIcao = lineItems[0];
				const openFlightsId = lineItems[1];
				const sourceAirportIataOrIcao = lineItems[2];
				const sourceAirportOpenFlightsId = lineItems[3];
				const destinationAirportIataOrIcao = lineItems[4];
				const destinationAirportOpenFlightsId = lineItems[5];
				const codeshare = lineItems[6];
                const numStops = lineItems[7];
                const planeTypes = lineItems[8].split(' ').map(x => x && x.trim() && Number(x));
                
                const airLineRef = store.airlines
                    .find({ '@id': { $eq: openFlightsId } })[0];
                const sourceAirportRef = store.airports
                    .find({ '@id': { $eq: consts.ONTOLOGY.INST_AIRPORT + getUuid.default(sourceAirportIataOrIcao) } })[0];
                const destinationAirportRef = store.airports
                    .find({ '@id': { $eq: consts.ONTOLOGY.INST_AIRPORT + getUuid.default(destinationAirportIataOrIcao) } })[0];

                if (airLineRef && sourceAirportRef  && destinationAirportRef) {
                    // Fetch or create route entity
                    const routeId = consts.ONTOLOGY.INST_ROUTE + getUuid.default(sourceAirportOpenFlightsId) + ' ' +  + getUuid.default(destinationAirportOpenFlightsId);
                    let routeObjectProp: EntityContainer = {};
                    if (store.routes.find({ '@id': { $eq: routeId } })[0] ) {
                        routeObjectProp[consts.ONTOLOGY.HAS_ROUTE] = store.routes.find({ '@id': { $eq: routeId } })[0];
                        const airlines = routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties
                            .filter(ref => !!ref[consts.ONTOLOGY.HAS_AIRLINE])
                            .filter(ref => ref[consts.ONTOLOGY.HAS_AIRLINE]['@id'] === airLineRef['@id']);
                        if (!airlines.length) {
                            routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                                entityRefMaker(
                                    consts.ONTOLOGY.HAS_AIRLINE,
                                    store.airlines,
                                    airLineRef['@id']
                            ));
                            airLineRef.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_ROUTE, routeObjectProp));
                        }
                    } else {
                        routeObjectProp = entityMaker(
                            consts.ONTOLOGY.HAS_ROUTE,
                            consts.ONTOLOGY.ONT_ROUTE,
                            routeId,
                            `The Route between ${sourceAirportRef[consts.RDFS.label]} and ${destinationAirportRef[consts.RDFS.label]}`);
                        if (planeTypes.length) {
                            planeTypes.forEach(pt => {
                                const aircraftTypeId = consts.ONTOLOGY.INST_ROUTE + getUuid.default(pt);
                                let aircraftTypeRef = store.aircraftTypes.find({ '@id': { $eq: aircraftTypeId } })[0];
                                let aircraftTypeObjProp = {};
                                if (!aircraftTypeRef) {
                                    aircraftTypeObjProp = entityMaker(
                                        consts.ONTOLOGY.HAS_AIRCRAFT_TYPE,
                                        consts.ONTOLOGY.ONT_AIRCRAFT_TYPE,
                                        aircraftTypeId,
                                        `AirCraft Type`);
                                    aircraftTypeRef = aircraftTypeObjProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE];
                                    aircraftTypeRef.datatypeProperties[consts.ONTOLOGY.DT_PLANE_TYPE_CODE] = pt;
                                    store.aircraftTypes.insert(aircraftTypeObjProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE]);
                                }
                                routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                                    entityRefMaker(
                                        consts.ONTOLOGY.HAS_AIRCRAFT_TYPE,
                                        store.aircraftTypes,
                                        aircraftTypeRef['@id']
                                ));
                            });
                        }
                        
                        routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                            entityRefMaker(
                                consts.ONTOLOGY.HAS_SOURCE_AIRPORT,
                                store.airports,
                                sourceAirportRef['@id']
                        ));
                        routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                            entityRefMaker(
                                consts.ONTOLOGY.HAS_DESTINATION_AIRPORT,
                                store.airports,
                                destinationAirportRef['@id']
                        ));
                    }

                    store.debugLogger(`Line from file: ${airlineIataORIcao}, ${openFlightsId}, ${sourceAirportIataOrIcao}, ${destinationAirportIataOrIcao}, ${numStops}, ${planeTypes.join(' ')}`);
                }
			}
		});
	}
}
