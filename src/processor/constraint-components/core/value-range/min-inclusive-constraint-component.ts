import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinInclusiveComponentIRI, MinInclusiveParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MinInclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinInclusiveComponentIRI, [{ iri: MinInclusiveParameterIRI }]);
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

		const minInclusiveValue = constraint.get(MinInclusiveParameterIRI.value);

		for (const valueNode of valueNodes) {
			const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (${minInclusiveValue} <= ${valueNode})
					}
				`);

			if (!result.boolean) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
