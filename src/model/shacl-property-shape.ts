import { ShaclShape } from './shacl-shape';
import { ShaclValidationResult } from './shacl-validation-report';
import { IRI, NonBlankNode, RdfTerm } from 'rdflib-ts';

export interface ShaclPropertyPath {
	pathType: string,
	pathValue: IRI,
	sparqlPathString: string
}

export class ShaclPropertyShape extends ShaclShape {
	public path: ShaclPropertyPath;

	public constructor(iri: IRI, path?: ShaclPropertyPath) {
		super(iri);
		this.path = {
			pathType: null,
			pathValue: null,
			sparqlPathString: null
		};
	}

	public createValidationResult(focusNode: NonBlankNode, value?: RdfTerm, sourceConstraintComponent?: IRI): ShaclValidationResult {
		const result = super.createValidationResult(focusNode, value, sourceConstraintComponent);
		result.resultPath = this.path.pathValue;

		return result;
	}

}