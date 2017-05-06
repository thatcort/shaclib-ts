import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { XoneComponentIRI, XoneParameterIRI } from '../../../../model/constants';

export class XoneConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(XoneComponentIRI, [{ iri: XoneParameterIRI, shapeExpecting: true, listTaking: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let xoneShapes = constraint.get(XoneParameterIRI.value) as ShaclShape[];
		let validator = new ShaclValidator();

		for (let valueNode of valueNodes) {
			let conformCount = 0;
			let details: IShaclValidationResult[] = [];

			for (let shape of xoneShapes) {
				let results = await validator.validateShape(shapes, shape, dataGraph, [<NonBlankNode>valueNode]);
				if (results.length === 0) {
					conformCount++;
				} else {
					details = details.concat(results);
				}
			}

			let validationResult = sourceShape.createValidationResult(focusNode, valueNode, this.iri);
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