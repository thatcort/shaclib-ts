import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { DisjointComponentIRI, DisjointParameterIRI } from '../../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, ISparqlQueryResultBinding, ITripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore, RdfTerm } from 'rdflib-ts';

export class DisjointConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(DisjointComponentIRI, [{ iri: DisjointParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let disjointParam = constraint.get(DisjointParameterIRI.value);

		let results = await dataGraph.queryAsync<ITripleQueryResult>(`
				SELECT DISTINCT ?object 
				WHERE
				{
					${focusNode} ${disjointParam} ?object .
				}
			`);

		let disjointValues = results.results.bindings.map(b => RdfFactory.createRdfTermFromSparqlResultBinding(b.object));

		for (let valueNode of valueNodes) {
			if (disjointValues.some(dv => dv.toString() === valueNode.toString())) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 