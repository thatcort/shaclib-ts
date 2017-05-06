import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { EqualsComponentIRI, EqualsParameterIRI } from '../../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, ISparqlQueryResultBinding, ITripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore, RdfTerm } from 'rdflib-ts';

export class EqualsConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(EqualsComponentIRI, [{ iri: EqualsParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let equalsParam = constraint.get(EqualsParameterIRI.value);

		for (let valueNode of valueNodes) {
			let existsResult = await dataGraph.queryAsync<any>(`
				ASK
				{
					${focusNode} ${equalsParam} ${valueNode}
				}
			`);

			if (!existsResult.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		let results = await dataGraph.queryAsync<ITripleQueryResult>(`
				SELECT DISTINCT ?object 
				WHERE
				{
					${focusNode} ${equalsParam} ?object .
				}
			`);

		for (let result of results.results.bindings) {
			let rdfTerm = RdfFactory.createRdfTermFromSparqlResultBinding(result.object);
			if (!valueNodes.some(vn => vn.toString() === rdfTerm.toString())) {
				validationResults.push(sourceShape.createValidationResult(focusNode, rdfTerm, this.iri));
			}
		}

		return validationResults;
	}
} 