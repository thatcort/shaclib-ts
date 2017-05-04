import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { InComponentIRI, InParameterIRI } from '../../../../model/constants';
import { ITripleQueryResult, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';
import { ISparqlQueryResultBinding, RdfTerm, BlankNode, InvalidOperationError, IRI, ISparqlQueryResult } from 'rdflib-ts';

export class InConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(InComponentIRI, [{ iri: InParameterIRI, listTaking: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let inParameter = constraint.get(InParameterIRI.value) as RdfTerm[];
		let listMembers = inParameter.map(elem => elem.toString());
		
		for (let valueNode of valueNodes) {
			if (!listMembers.some(lm => lm === valueNode.toString())) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 