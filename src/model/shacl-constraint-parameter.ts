import { IRI } from 'rdflib-ts';

export interface ShaclConstraintParameter {
	iri: IRI;
	optional?: boolean;
	shapeExpecting?: boolean;
	listTaking?: boolean;
	shared?: boolean;
}
