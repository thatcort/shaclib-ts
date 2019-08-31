import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore, TypedLiteral, IRI } from 'rdflib-ts';
import {
	PropertyParameterIRI,
	QualifiedMaxCountParameterIRI,
	QualifiedMinCountParameterIRI
} from '../../../../model/constants';
import {
	QualifiedValueShapeComponentIRI,
	QualifiedValueShapeParameterIRI,
	QualifiedValueShapesDisjointParameterIRI
} from '../../../../model/constants';

export class QualifiedValueShapeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(QualifiedValueShapeComponentIRI, [
			{ iri: QualifiedValueShapeParameterIRI, shapeExpecting: true },
			{ iri: QualifiedMaxCountParameterIRI },
			{ iri: QualifiedMinCountParameterIRI },
			{ iri: QualifiedValueShapesDisjointParameterIRI, optional: true }
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

		const valueShape = constraint.get(QualifiedValueShapeParameterIRI.value) as ShaclShape;
		const disjoint = constraint.get(QualifiedValueShapesDisjointParameterIRI.value);

		const maxCountParameter = constraint.get(QualifiedMaxCountParameterIRI.value);
		const minCountParameter = constraint.get(QualifiedMinCountParameterIRI.value);

		const maxCountValue = maxCountParameter
			? Number.parseInt((maxCountParameter as TypedLiteral).value)
			: undefined;
		const minCountValue = minCountParameter
			? Number.parseInt((minCountParameter as TypedLiteral).value)
			: undefined;

		const validator = new ShaclValidator();
		let siblingShapes: ShaclShape[] = [];

		if (disjoint && disjoint.value.toLowerCase() === 'true') {
			siblingShapes = shapes.filter(s =>
				s.constraints.some(
					c =>
						c.iri.value === PropertyParameterIRI.value &&
						(c.value as IRI).value === valueShape.iri.value
				)
			);
		}

		let conformCount = 0;

		for (const valueNode of valueNodes) {
			let conformsToSibling = false;

			for (const siblingShape of siblingShapes) {
				const siblingResults = await validator.validateShape(
					shapes,
					siblingShape,
					dataGraph,
					[valueNode as NonBlankNode]
				);
				if (siblingResults.length > 0) {
					conformsToSibling = true;
					break;
				}
			}

			if (!conformsToSibling) {
				const results = await validator.validateShape(shapes, valueShape, dataGraph, [
					valueNode as NonBlankNode
				]);
				if (results.length === 0) {
					conformCount++;
				}
			}
		}

		if (
			(maxCountValue && conformCount > maxCountValue) ||
			(minCountValue && conformCount < minCountValue)
		) {
			validationResults.push(
				sourceShape.createValidationResult(
					focusNode,
					new TypedLiteral(conformCount.toString(), 'xsd:integer')
				)
			);
		}

		return validationResults;
	}
}
