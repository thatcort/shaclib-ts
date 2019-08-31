import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxExclusiveComponentIRI, MaxExclusiveParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MaxExclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxExclusiveComponentIRI, [{ iri: MaxExclusiveParameterIRI }]);
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

		const maxExclusiveValue = constraint.get(MaxExclusiveParameterIRI.value);

		for (const valueNode of valueNodes) {
			const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (${maxExclusiveValue} > ${valueNode})
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
