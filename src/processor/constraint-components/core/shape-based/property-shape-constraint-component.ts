import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { PropertyShapeComponentIRI, PropertyParameterIRI } from '../../../../model/constants';

export class PropertyShapeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(PropertyShapeComponentIRI, [{ iri: PropertyParameterIRI, shapeExpecting: true }]);
	}

	public async validateAsync(
		shapes: ShaclShape[],
		sourceShape: ShaclShape,
		dataGraph: RdfStore,
		focusNode: NonBlankNode,
		valueNodes: RdfNode[],
		constraint: Map<string, any>
	): Promise<ShaclValidationResult[]> {
		const propertyShape = constraint.get(PropertyParameterIRI.value) as ShaclPropertyShape;
		const validator = new ShaclValidator();

		const results = await validator.validateShape(
			shapes,
			propertyShape,
			dataGraph,
			valueNodes as NonBlankNode[]
		);

		if (results.length > 0) {
			const parentResult = sourceShape.createValidationResult(focusNode, null, this.iri);

			for (const result of results) {
				result.details.push(parentResult);
			}

			return results;
		}

		return [];
	}
}
