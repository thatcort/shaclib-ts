import { IShaclConstraint } from '../../../model/shacl-constraint';
import { ShaclShape } from '../../../model/shacl-shape';
import { ShaclValidator } from '../../shacl-validator'
import { ShaclNodeShape } from '../../../model/shacl-node-shape';
import { ConstraintComponent } from '../constraint-component';
import { IShaclValidationResult } from '../../../model/shacl-validation-report';
import { SparqlComponentIRI, SparqlParameterIRI, SelectParameterIRI, AskParameterIRI } from '../../../model/constants';
import { InvalidOperationError, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore, XsdIntegerIRI, TypedLiteral, PlainLiteral, NamespaceManagerInstance } from 'rdflib-ts';

export class SparqlConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(SparqlComponentIRI, [{ iri: SparqlParameterIRI, shapeExpecting: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let sparqlShape = constraint.get(SparqlParameterIRI.value) as ShaclShape;
		let validator = new ShaclValidator();

		for (let valueNode of valueNodes) {
			let results = await validator.validateShape(shapes, sparqlShape, dataGraph, [<NonBlankNode>valueNode]);

			if (results.length > 0) {
				let validationResult = sourceShape.createValidationResult(focusNode, valueNode, this.iri);
				validationResult.details = validationResult.details.concat(results);
				validationResults.push(validationResult);
			}
		}
		
		return validationResults;
	}
} 