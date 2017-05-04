import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinInclusiveComponentIRI, MinInclusiveParameterIRI } from '../../../../model/constants';
import { ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MinInclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinInclusiveComponentIRI, [{ iri: MinInclusiveParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let minInclusiveValue = constraint.get(MinInclusiveParameterIRI.value);

		for (let valueNode of valueNodes) {
			let result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (${minInclusiveValue} <= ${valueNode})
					}
				`);

			if (!result.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 