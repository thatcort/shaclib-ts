import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { InComponentIRI, InParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { RdfTerm } from 'rdflib-ts';

export class InConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(InComponentIRI, [{ iri: InParameterIRI, listTaking: true }]);
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

		const inParameter = constraint.get(InParameterIRI.value) as RdfTerm[];
		const listMembers = inParameter.map(elem => elem.toString());

		for (const valueNode of valueNodes) {
			if (!listMembers.some(lm => lm === valueNode.toString())) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
