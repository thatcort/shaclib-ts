import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxInclusiveComponentIRI, MaxInclusiveParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore, SparqlQueryResult } from 'rdflib-ts';

export class MaxInclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxInclusiveComponentIRI, [{ iri: MaxInclusiveParameterIRI }]);
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

		const maxInclusiveValue = constraint.get(MaxInclusiveParameterIRI.value);

		for (const valueNode of valueNodes) {
			const result = await dataGraph.queryAsync<SparqlQueryResult<any>>(`
					ASK
					{
						FILTER (${maxInclusiveValue} >= ${valueNode})
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
