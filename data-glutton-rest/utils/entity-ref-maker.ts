import { EntityContainer } from '../models/entity-container';

export function entityRefMaker(
	predicateURI: string,
	entityContainer: EntityContainer,
	unWrapPredicate?: string): EntityContainer {
	const entity = entityContainer[unWrapPredicate || predicateURI];
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