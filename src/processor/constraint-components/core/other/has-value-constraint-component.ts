import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { HasValueComponentIRI, HasValueParameterIRI } from '../../../../model/constants';
import { ITripleQueryResult, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';
import { ISparqlQueryResultBinding, RdfTerm, BlankNode, InvalidOperationError, IRI, ISparqlQueryResult } from 'rdflib-ts';

export class HasValueConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(HasValueComponentIRI, [{ iri: HasValueParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let targetValue = constraint.get(HasValueParameterIRI.value) as RdfTerm;

		if (!valueNodes.some(vn => vn.toString() === targetValue.toString())) {
			validationResults.push(sourceShape.createValidationResult(focusNode, targetValue, this.iri));
		}

		return validationResults;
	}
} 