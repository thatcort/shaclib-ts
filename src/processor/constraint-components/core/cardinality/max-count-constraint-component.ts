import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxCountComponentIRI, MaxCountParameterIRI } from '../../../../model/constants';
import {
	InvalidOperationError,
	Literal,
	NonBlankNode,
	RdfNode,
	RdfStore,
	XsdIntegerIRI,
	TypedLiteral
} from 'rdflib-ts';

export class MaxCountConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxCountComponentIRI, [{ iri: MaxCountParameterIRI }]);
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

		const maxCountParameter = constraint.get(MaxCountParameterIRI.value);
		const maxCountValue = Number.parseInt((maxCountParameter as Literal).value);

		if (sourceShape instanceof ShaclNodeShape) {
			throw new InvalidOperationError('ShaclNodeShape can not declare maxCount constraint');
		}

		if (valueNodes.length > maxCountValue) {
			validationResults.push(
				sourceShape.createValidationResult(
					focusNode,
					new TypedLiteral(`${valueNodes.length}`, XsdIntegerIRI),
					this.iri
				)
			);
		}

		return validationResults;
	}
}
