import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { LessThanComponentIRI, LessThanParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class LessThanConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(LessThanComponentIRI, [{ iri: LessThanParameterIRI }]);
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

		const lessThanParam = constraint.get(LessThanParameterIRI.value);

		for (const valueNode of valueNodes) {
			const results = await dataGraph.queryAsync<any>(`
				ASK
				{
					${focusNode} ${lessThanParam} ?value .
					FILTER (${valueNode} >= ?value) .
				}
			`);

			if (results.boolean) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
