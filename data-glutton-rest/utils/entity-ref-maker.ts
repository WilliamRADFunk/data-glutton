import { Entity } from '../models/entity';
import { EntityContainer } from '../models/entity-container';

export function entityRefMaker(
	predicateURI: string,
	entityContainer: EntityContainer|Collection<Entity>,
	unWrapPredicateOrId?: string,
	fromPOGO?: boolean): EntityContainer {
	let entity;
	if (fromPOGO) {
		entity = (entityContainer as EntityContainer)[unWrapPredicateOrId];
	} else if (unWrapPredicateOrId) {
		entity = (entityContainer as Collection<Entity>).find({ '@id': { $eq: unWrapPredicateOrId } })[0];
	} else {
		entity = (entityContainer as EntityContainer)[predicateURI];
	}
	const objectProp: EntityContainer = {};
	objectProp[predicateURI] = {
		'@id': entity['@id'],
		'@type': entity['@type'],
		datatypeProperties: {},
		'http://www.w3.org/2000/01/rdf-schema#label': entity['http://www.w3.org/2000/01/rdf-schema#label'],
		objectProperties: []
	};
	return objectProp;
};