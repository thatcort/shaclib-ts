import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { DisjointComponentIRI, DisjointParameterIRI } from '../../../../model/constants';
import { TripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';

export class DisjointConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(DisjointComponentIRI, [{ iri: DisjointParameterIRI }]);
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

		const disjointParam = constraint.get(DisjointParameterIRI.value);

		const results = await dataGraph.queryAsync<TripleQueryResult>(`
				SELECT DISTINCT ?object 
				WHERE
				{
					${focusNode} ${disjointParam} ?object .
				}
			`);

		const disjointValues = results.results.bindings.map(b =>
			RdfFactory.createRdfTermFromSparqlResultBinding(b.object)
		);

		for (const valueNode of valueNodes) {
			if (disjointValues.some(dv => dv.toString() === valueNode.toString())) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
