import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { AndComponentIRI, AndParameterIRI } from '../../../../model/constants';

export class AndConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(AndComponentIRI, [{ iri: AndParameterIRI, shapeExpecting: true, listTaking: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let andShapes = constraint.get(AndParameterIRI.value) as ShaclShape[];
		let validator = new ShaclValidator();

		for (let valueNode of valueNodes) {
			for (let shape of andShapes) {
				let results = await validator.validateShape(shapes, shape, dataGraph, [<NonBlankNode>valueNode]);
				if (results.length > 0) {
					let validationResult = sourceShape.createValidationResult(focusNode, valueNode, this.iri);
					validationResult.details = validationResult.details.concat(results);
					validationResults.push(validationResult);
				}
			}
		}

		return validationResults;
	}
} 