import * as fs from 'graceful-fs';
import * as path from 'path';
import * as readline from 'readline';
import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';

let counter = 0;
let totalLines;
let oldPercent = 0;

// Populate remaining airports from datahub list
export async function getRoutesOpenFlights(): Promise<void> {
    return new Promise((resolve, reject) => {
        totalLines = store.routesData.length;
        store.routesData.forEach(line => {
            const percent = Math.ceil((counter / totalLines) * 100);
            if (percent !== oldPercent) {
                oldPercent = percent;
                store.progressLogger('RoutesFromOpenFlights', counter / totalLines);
            }
            const lineItems = ((line && line.split(',')) || []).map(item => item && item.replace(/\"/g, ''));
            if (lineItems.length === 9) {
                const airlineIataORIcao = lineItems[0];
                const openFlightsId = lineItems[1];
                const sourceAirportIataOrIcao = lineItems[2];
                const sourceAirportOpenFlightsId = lineItems[3];
                const destinationAirportIataOrIcao = lineItems[4];
                const destinationAirportOpenFlightsId = lineItems[5];
                const codeshare = lineItems[6];
                const numStops = lineItems[7];
                const planeTypes = lineItems[8].split(' ').map(x => x && x.trim()).filter(y => !!y);

                const airlineRef = store.airlines
                    .find({ '@id': { $eq: consts.ONTOLOGY.INST_AIRLINE + getUuid.default(openFlightsId.toString()) } })[0];

                if (!airlineRef) {
                    counter++;
                    return;
                }

                let sourceAirportRef;
                const sourceAirportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(sourceAirportIataOrIcao);
                const searchBySourceObject = {};
                searchBySourceObject[consts.ONTOLOGY.DT_IATA_CODE] = { $eq: sourceAirportIataOrIcao };
                if (store.airportMemoTable[sourceAirportIataOrIcao]) {
                    sourceAirportRef = store.airportMemoTable[sourceAirportIataOrIcao];
                } else if (store.airports.find({ '@id': { $eq: sourceAirportId } })[0]) {
                    sourceAirportRef = store.airports.find({ '@id': { $eq: sourceAirportId } })[0];
                    store.airportMemoTable[sourceAirportIataOrIcao] = sourceAirportRef;
                } else if (store.airports.find(searchBySourceObject)[0]) {
                    sourceAirportRef = store.airports.find(searchBySourceObject)[0];
                    store.airportMemoTable[sourceAirportIataOrIcao] = sourceAirportRef;
                }

                if (!sourceAirportRef) {
                    counter++;
                    return;
                }

                let destinationAirportRef;
                const destinationAirportId = consts.ONTOLOGY.INST_AIRPORT + getUuid.default(destinationAirportIataOrIcao);
                const searchByDestinationObject = {};
                searchByDestinationObject[consts.ONTOLOGY.DT_IATA_CODE] = { $eq: destinationAirportIataOrIcao };
                if (store.airportMemoTable[destinationAirportIataOrIcao]) {
                    destinationAirportRef = store.airportMemoTable[destinationAirportIataOrIcao];
                } else if (store.airports.find({ '@id': { $eq: destinationAirportId } })[0]) {
                    destinationAirportRef = store.airports.find({ '@id': { $eq: destinationAirportId } })[0];
                    store.airportMemoTable[destinationAirportIataOrIcao] = destinationAirportRef;
                } else if (store.airports.find(searchByDestinationObject)[0]) {
                    destinationAirportRef = store.airports.find(searchByDestinationObject)[0];
                    store.airportMemoTable[destinationAirportIataOrIcao] = destinationAirportRef;
                }

                if (!sourceAirportRef) {
                    counter++;
                    return;
                }

                if (airlineRef && sourceAirportRef  && destinationAirportRef) {
                    // Fetch or create route entity
                    const routeId = consts.ONTOLOGY.INST_ROUTE + getUuid.default(sourceAirportOpenFlightsId) + ' ' +  + getUuid.default(destinationAirportOpenFlightsId);
                    let routeObjectProp: EntityContainer = {};
                    if (store.routes.find({ '@id': { $eq: routeId } })[0] ) {
                        routeObjectProp[consts.ONTOLOGY.HAS_ROUTE] = store.routes.find({ '@id': { $eq: routeId } })[0];
                        const airlines = routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties
                            .filter(ref => !!ref[consts.ONTOLOGY.HAS_AIRLINE])
                            .filter(ref => ref[consts.ONTOLOGY.HAS_AIRLINE]['@id'] === airlineRef['@id']);
                        if (!airlines.length) {
                            routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                                entityRefMaker(
                                    consts.ONTOLOGY.HAS_AIRLINE,
                                    store.airlines,
                                    airlineRef['@id']
                            ));
                            airlineRef.objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_ROUTE, routeObjectProp));
                        }
                    } else {
                        routeObjectProp = entityMaker(
                            consts.ONTOLOGY.HAS_ROUTE,
                            consts.ONTOLOGY.ONT_ROUTE,
                            routeId,
                            `The Route between ${sourceAirportRef[consts.RDFS.label]} and ${destinationAirportRef[consts.RDFS.label]}`);
                        if (planeTypes.length) {
                            planeTypes.forEach(pt => {
                                const aircraftTypeId = consts.ONTOLOGY.INST_AIRCRAFT_TYPE + getUuid.default(pt);
                                const aircraftTypeObjProp = {};
                                if (store.aircraftTypes.find({ '@id': { $eq: aircraftTypeId } })[0] ) {
                                    aircraftTypeObjProp[consts.ONTOLOGY.HAS_AIRCRAFT_TYPE] = store.aircraftTypes.find({ '@id': { $eq: aircraftTypeId } })[0];
                                    routeObjectProp[consts.ONTOLOGY.HAS_ROUTE].objectProperties.push(
                                        entityRefMaker(
                                            consts.ONTOLOGY.HAS_AIRCRAFT_TYPE,
                                            store.aircraftTypes,
                                            aircraftTypeId
                                    ));
                                }
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
                        store.routes.insert(routeObjectProp[consts.ONTOLOGY.HAS_ROUTE]);
                    }
                }
            }
            counter++;
        });
        resolve();
    });
}
