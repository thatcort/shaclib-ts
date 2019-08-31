import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { NodeComponentIRI, NodeParameterIRI } from '../../../../model/constants';

export class NodeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(NodeComponentIRI, [{ iri: NodeParameterIRI, shapeExpecting: true }]);
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

		const nodeShape = constraint.get(NodeParameterIRI.value) as ShaclNodeShape;
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			const results = await validator.validateShape(shapes, nodeShape, dataGraph, [
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
