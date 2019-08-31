import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinExclusiveComponentIRI, MinExclusiveParameterIRI } from '../../../../model/constants';
import { SparqlQueryResult, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MinExclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinExclusiveComponentIRI, [{ iri: MinExclusiveParameterIRI }]);
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

		const minExclusiveValue = constraint.get(MinExclusiveParameterIRI.value);

		for (const valueNode of valueNodes) {
			const result = await dataGraph.queryAsync<SparqlQueryResult<any>>(`
					ASK
					{
						FILTER (${minExclusiveValue} < ${valueNode})
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
