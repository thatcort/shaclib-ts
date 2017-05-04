import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore, Literal, TypedLiteral, IRI } from 'rdflib-ts';
import { MinCountComponentIRI, PropertyParameterIRI, QualifiedMaxCountParameterIRI, QualifiedMinCountParameterIRI } from '../../../../model/constants';
import { QualifiedValueShapeComponentIRI, QualifiedValueShapeParameterIRI, QualifiedValueShapesDisjointParameterIRI } from '../../../../model/constants';

export class QualifiedMinCountConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(QualifiedValueShapeComponentIRI, [
			{ iri: QualifiedValueShapeParameterIRI, shapeExpecting: true },
			{ iri: QualifiedMinCountParameterIRI },
			{ iri: QualifiedValueShapesDisjointParameterIRI, optional: true }
		])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let valueShape = constraint.get(QualifiedValueShapeParameterIRI.value) as ShaclShape;
		let disjoint = (constraint.get(QualifiedValueShapesDisjointParameterIRI.value) as Literal).value;
		let minCount = Number.parseInt((constraint.get(QualifiedMinCountParameterIRI.value) as TypedLiteral).value);

		let validator = new ShaclValidator()

		let siblingShapes: ShaclShape[] = [];

		if (disjoint.toLowerCase() === 'true') {
			siblingShapes = shapes.filter(s => s.constraints.some(c => c.iri.value === PropertyParameterIRI.value && (c.value as IRI).value === valueShape.iri.value))
		}

		let conformCount = 0;

		for (let valueNode of valueNodes) {
			let conformsToSibling = false;

			for (let siblingShape of siblingShapes) {
				let siblingResults = await validator.validateShape(shapes, siblingShape, dataGraph, [<NonBlankNode>valueNode]);
				if (siblingResults.length > 0) {
					conformsToSibling = true;
					break;
				}
			}

			if (!conformsToSibling) {
				let results = await validator.validateShape(shapes, valueShape, dataGraph, [<NonBlankNode>valueNode]);
				if (results.length === 0) {
					conformCount++;
				}
			}
		}

		if (conformCount < minCount) {
			validationResults.push(sourceShape.createValidationResult(focusNode, new TypedLiteral(conformCount.toString(), 'xsd:integer')));
		}

		return validationResults;
	}
} 