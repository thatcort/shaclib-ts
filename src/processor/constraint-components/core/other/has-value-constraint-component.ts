import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { HasValueComponentIRI, HasValueParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { RdfTerm } from 'rdflib-ts';

export class HasValueConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(HasValueComponentIRI, [{ iri: HasValueParameterIRI }]);
	}

	public async validateAsync(
		shapes: ShaclShape[],
		sourceShape: ShaclShape,
		dataGraph: RdfStore,
		focusNode: NonBlankNode,
		valueNodes: RdfNode[],
		constraint: Map<string, any>
	): Promise<ShaclValidationResult[]> {
		const validationResults: ShaclValidationResult[] = [];

		const targetValue = constraint.get(HasValueParameterIRI.value) as RdfTerm;

		if (!valueNodes.some(vn => vn.toString() === targetValue.toString())) {
			validationResults.push(
				sourceShape.createValidationResult(focusNode, targetValue, this.iri)
			);
		}

		return validationResults;
	}
}
