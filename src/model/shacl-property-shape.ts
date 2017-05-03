import { ShaclShape } from './shacl-shape';
import { IShaclValidationResult } from './shacl-validation-report';
import { IRI, NonBlankNode, RdfTerm } from 'rdflib-ts';

export interface IShaclPropertyPath {
	pathType: string,
	pathValue: IRI,
	sparqlPathString: string
}

export class ShaclPropertyShape extends ShaclShape {
	public path: IShaclPropertyPath;

	public constructor(iri: IRI) {
		super(iri);
		this.path = null;
	}

	public createValidationResult(focusNode: NonBlankNode, value?: RdfTerm, sourceConstraintComponent?: IRI): IShaclValidationResult {
		let result = super.createValidationResult(focusNode, value, sourceConstraintComponent);
		result.resultPath = this.path.pathValue;

		return result;
	}

}