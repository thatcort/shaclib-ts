import { IRI } from 'rdflib-ts';

export interface IShaclConstraintParameter {
	iri: IRI;
	optional?: boolean;
	shapeExpecting?: boolean;
	listTaking?: boolean;
}