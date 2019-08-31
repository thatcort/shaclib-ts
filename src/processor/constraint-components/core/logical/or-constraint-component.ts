import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclValidator } from '../../../shacl-validator';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';
import { OrComponentIRI, OrParameterIRI } from '../../../../model/constants';

export class OrConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(OrComponentIRI, [{ iri: OrParameterIRI, shapeExpecting: true, listTaking: true }]);
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

		const orShapes = constraint.get(OrParameterIRI.value) as ShaclShape[];
		const validator = new ShaclValidator();

		for (const valueNode of valueNodes) {
			let conforms = false;
			let details: ShaclValidationResult[] = [];

			for (const shape of orShapes) {
				const results = await validator.validateShape(shapes, shape, dataGraph, [
					valueNode as NonBlankNode
				]);
				if (results.length === 0) {
					conforms = true;
				} else {
					details = details.concat(results);
				}
			}

			if (!conforms) {
				const validationResult = sourceShape.createValidationResult(
					focusNode,
					valueNode,
					this.iri
				);
				validationResult.details = validationResult.details.concat(details);
				validationResults.push(validationResult);
			}
		}

		return validationResults;
	}
}
