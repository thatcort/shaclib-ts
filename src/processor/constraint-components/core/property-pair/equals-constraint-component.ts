import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { EqualsComponentIRI, EqualsParameterIRI } from '../../../../model/constants';
import { TripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';

export class EqualsConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(EqualsComponentIRI, [{ iri: EqualsParameterIRI }]);
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

		const equalsParam = constraint.get(EqualsParameterIRI.value);

		for (const valueNode of valueNodes) {
			const existsResult = await dataGraph.queryAsync<any>(`
				ASK
				{
					${focusNode} ${equalsParam} ${valueNode}
				}
			`);

			if (!existsResult.boolean) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		const results = await dataGraph.queryAsync<TripleQueryResult>(`
				SELECT DISTINCT ?object 
				WHERE
				{
					${focusNode} ${equalsParam} ?object .
				}
			`);

		for (const result of results.results.bindings) {
			const rdfTerm = RdfFactory.createRdfTermFromSparqlResultBinding(result.object);
			if (!valueNodes.some(vn => vn.toString() === rdfTerm.toString())) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, rdfTerm, this.iri)
				);
			}
		}

		return validationResults;
	}
}
