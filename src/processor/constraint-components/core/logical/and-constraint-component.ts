import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { AndComponentIRI, AndParameterIRI } from '../../../../model/constants';

export class AndConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(AndComponentIRI, [{ iri: AndParameterIRI, shapeExpecting: true, listTaking: true }]);
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

		const andShapes = constraint.get(AndParameterIRI.value) as ShaclShape[];
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			let details: ShaclValidationResult[] = [];

			for (const shape of andShapes) {
				const results = await validator.validateShape(shapes, shape, dataGraph, [
					valueNode as NonBlankNode
				]);
				if (results.length > 0) {
					details = details.concat(results);
				}
			}

			if (details.length > 0) {
				const validationResult = sourceShape.createValidationResult(
					focusNode,
					valueNode,
					this.iri
				);
				validationResult.details = validationResult.details.concat(details);
				validationResults.push(validationResult);
			}
		}

		return validationResults;
	}
}
