import { ShaclShape } from '../../model/shacl-shape';
import { ShaclValidationResult } from '../../model/shacl-validation-report';
import { ShaclConstraintParameter } from '../../model/shacl-constraint-parameter';
import { ArgumentError, IRI, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export abstract class ConstraintComponent {
	public iri: IRI;
	public parameters: ShaclConstraintParameter[];

	public constructor(iri: IRI, parameters: ShaclConstraintParameter[]) {
		if (!iri || !parameters) {
			throw new ArgumentError('iri and parameters are mandatory properties');
		}

		this.iri = iri;
		this.parameters = parameters;
	}

	public abstract async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<ShaclValidationResult[]>;
}