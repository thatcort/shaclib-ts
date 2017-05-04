import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { NodeComponentIRI, NodeParameterIRI } from '../../../../model/constants';

export class NodeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(NodeComponentIRI, [{ iri: NodeParameterIRI, shapeExpecting: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let nodeShape = constraint.get(NodeParameterIRI.value) as ShaclNodeShape;
		let validator = new ShaclValidator();

		for (let valueNode of valueNodes) {
			let results = await validator.validateShape(shapes, nodeShape, dataGraph, [<NonBlankNode>valueNode]);

			if (results.length > 0) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 