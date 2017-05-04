import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclNodeShape } from '../../../../model/shacl-node-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinCountComponentIRI, MinCountParameterIRI } from '../../../../model/constants';
import { InvalidOperationError, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore, XsdIntegerIRI, TypedLiteral } from 'rdflib-ts';


export class MinCountConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinCountComponentIRI, [{ iri: MinCountParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let minCountParameter = constraint.get(MinCountParameterIRI.value);
		let minCountValue = Number.parseInt((<Literal>minCountParameter).value);

		if (sourceShape instanceof ShaclNodeShape) {
			throw new InvalidOperationError('ShaclNodeShape can not declare minCount constraint');
		}

		if (valueNodes.length < minCountValue) {
			validationResults.push(sourceShape.createValidationResult(focusNode, new TypedLiteral(`${valueNodes.length}`, XsdIntegerIRI), this.iri));
		}

		return validationResults;
	}
} 