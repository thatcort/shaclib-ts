import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { NotComponentIRI, NotParameterIRI } from '../../../../model/constants';

export class NotConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(NotComponentIRI, [{ iri: NotParameterIRI, shapeExpecting: true }]);
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

		const shape = constraint.get(NotParameterIRI.value) as ShaclShape;
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			const results = await validator.validateShape(shapes, shape, dataGraph, [
				valueNode as NonBlankNode
			]);
			if (results.length === 0) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
