import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { LessThanComponentIRI, LessThanParameterIRI } from '../../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, ISparqlQueryResultBinding, ITripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore, RdfTerm } from 'rdflib-ts';

export class LessThanConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(LessThanComponentIRI, [{ iri: LessThanParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let lessThanParam = constraint.get(LessThanParameterIRI.value);

		for (let valueNode of valueNodes) {
			let results = await dataGraph.queryAsync<any>(`
				ASK
				{
					${focusNode} ${lessThanParam} ?value .
					BIND (${valueNode} < ?value AS ?result) .
					FILTER (!bound(?result) || !(?result)) .
				}
			`);

			if (!results.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 