import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxExclusiveComponentIRI, MaxExclusiveParameterIRI } from '../../../../model/constants';
import { ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MaxExclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxExclusiveComponentIRI, [{ iri: MaxExclusiveParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let maxExclusiveValue = constraint.get(MaxExclusiveParameterIRI.value);

		for (let valueNode of valueNodes) {
			let result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (${maxExclusiveValue} > ${valueNode})
					}
				`);

			if (!result.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 