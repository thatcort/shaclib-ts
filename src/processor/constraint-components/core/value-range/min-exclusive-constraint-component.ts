import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinExclusiveComponentIRI, MinExclusiveParameterIRI } from '../../../../model/constants';
import { ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class MinExclusiveConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinExclusiveComponentIRI, [{ iri: MinExclusiveParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let minExclusiveValue = constraint.get(MinExclusiveParameterIRI.value);

		for (let valueNode of valueNodes) {
			let result = await dataGraph.queryAsync<ISparqlQueryResult<any>>(`
					ASK
					{
						FILTER (${minExclusiveValue} < ${valueNode})
					}
				`);

			if (!result.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 