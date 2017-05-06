import { IRI } from 'rdflib-ts';
import { ShaclShape } from './shacl-shape';

export class ShaclNodeShape extends ShaclShape {

	public constructor(iri: IRI) {
		super(iri);
	}
}