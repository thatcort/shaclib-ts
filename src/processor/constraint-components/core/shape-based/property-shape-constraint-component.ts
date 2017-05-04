import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { PropertyShapeComponentIRI, PropertyParameterIRI } from '../../../../model/constants';

export class PropertyShapeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(PropertyShapeComponentIRI, [{ iri: PropertyParameterIRI, shapeExpecting: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		
		let propertyShape = constraint.get(PropertyParameterIRI.value) as ShaclPropertyShape;
		let validator = new ShaclValidator();

		let results = await validator.validateShape(shapes, propertyShape, dataGraph, <NonBlankNode[]>valueNodes);

		if (results.length > 0) {
			let parentResult = sourceShape.createValidationResult(focusNode, null, this.iri);

			for (let result of results) {
				result.details.push(parentResult);
			}

			return results;
		}

		return [];
	}
} 