import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { LessThanOrEqualsComponentIRI, LessThanOrEqualsParameterIRI } from '../../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, ISparqlQueryResultBinding, ITripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore, RdfTerm } from 'rdflib-ts';

export class LessThanOrEqualsConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(LessThanOrEqualsComponentIRI, [{ iri: LessThanOrEqualsParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let lessThanOrEqualsParam = constraint.get(LessThanOrEqualsParameterIRI.value);

		for (let valueNode of valueNodes) {
			let results = await dataGraph.queryAsync<any>(`
				ASK
				{
					${focusNode} ${lessThanOrEqualsParam} ?value .
					FILTER (${valueNode} > ?value) .
				}
			`);

			if (results.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 