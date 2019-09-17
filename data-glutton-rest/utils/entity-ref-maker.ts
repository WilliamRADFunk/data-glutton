import { Entity } from '../models/entity';
import { EntityContainer } from '../models/entity-container';

export function entityRefMaker(
	predicateURI: string,
	entityContainer: EntityContainer|Collection<Entity>,
	unWrapPredicate?: string): EntityContainer {
	let entity;
	if (unWrapPredicate) {
		entity = (entityContainer as Collection<Entity>).find({ '@id': { $eq: unWrapPredicate } })[0];
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