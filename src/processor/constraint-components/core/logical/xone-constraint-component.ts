import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { XoneComponentIRI, XoneParameterIRI } from '../../../../model/constants';

export class XoneConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(XoneComponentIRI, [
			{ iri: XoneParameterIRI, shapeExpecting: true, listTaking: true }
		]);
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

		const xoneShapes = constraint.get(XoneParameterIRI.value) as ShaclShape[];
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			let conformCount = 0;
			let details: ShaclValidationResult[] = [];

			for (const shape of xoneShapes) {
				const results = await validator.validateShape(shapes, shape, dataGraph, [
					valueNode as NonBlankNode
				]);
				if (results.length === 0) {
					conformCount++;
				} else {
					details = details.concat(results);
				}
			}

			const validationResult = sourceShape.createValidationResult(
				focusNode,
				valueNode,
				this.iri
			);
			if (conformCount === 0) {
				validationResult.details = validationResult.details.concat(details);
			}

			if (conformCount !== 1) {
				validationResults.push(validationResult);
			}
		}

		return validationResults;
	}
}
