import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxInclusiveComponentIRI, MaxInclusiveParameterIRI } from '../../../../model/constants';
import { ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MaxInclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxInclusiveComponentIRI, [{ iri: MaxInclusiveParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let maxInclusiveValue = constraint.get(MaxInclusiveParameterIRI.value);

		for (let valueNode of valueNodes) {
			let result = await dataGraph.queryAsync<ISparqlQueryResult<any>>(`
					ASK
					{
						FILTER (${maxInclusiveValue} >= ${valueNode})
					}
				`);

			if (!result.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 