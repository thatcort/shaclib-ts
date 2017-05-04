import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { NotComponentIRI, NotParameterIRI } from '../../../../model/constants';

export class NotConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(NotComponentIRI, [{ iri: NotParameterIRI, shapeExpecting: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let shape = constraint.get(NotParameterIRI.value) as ShaclShape;
		let validator = new ShaclValidator();

		for (let valueNode of valueNodes) {
			let results = await validator.validateShape(shapes, shape, dataGraph, [<NonBlankNode>valueNode]);
			if (results.length === 0) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 
