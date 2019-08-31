import { ShaclShape } from '../../../model/shacl-shape';
import { ShaclValidator } from '../../shacl-validator';

import { ConstraintComponent } from '../constraint-component';
import { ShaclValidationResult } from '../../../model/shacl-validation-report';
import { SparqlComponentIRI, SparqlParameterIRI } from '../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class SparqlConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(SparqlComponentIRI, [{ iri: SparqlParameterIRI, shapeExpecting: true }]);
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

		const sparqlShape = constraint.get(SparqlParameterIRI.value) as ShaclShape;
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			const results = await validator.validateShape(shapes, sparqlShape, dataGraph, [
				valueNode as NonBlankNode
			]);

			if (results.length > 0) {
				const validationResult = sourceShape.createValidationResult(
					focusNode,
					valueNode,
					this.iri
				);
				validationResult.details = validationResult.details.concat(results);
				validationResults.push(validationResult);
			}
		}

		return validationResults;
	}
}
