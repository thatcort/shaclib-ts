import { IRI } from 'rdflib-ts';

export interface ShaclConstraint {
	iri: IRI;
	value: any;
}