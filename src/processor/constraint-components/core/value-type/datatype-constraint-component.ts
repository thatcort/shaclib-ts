import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { DatatypeComponentIRI, DatatypeParameterIRI } from '../../../../model/constants';
import { IRI, NonBlankNode, RdfNode, RdfStore, TypedLiteral, XsdStringIRI } from 'rdflib-ts';

export class DatatypeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(DatatypeComponentIRI, [{ iri: DatatypeParameterIRI }]);
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

		const dataTypeParameter = constraint.get(DatatypeParameterIRI.value);
		const dataTypeValue = (dataTypeParameter as IRI).value;

		for (const valueNode of valueNodes) {
			const isTypedLiteral = valueNode instanceof TypedLiteral;

			if (
				(isTypedLiteral && (valueNode as TypedLiteral).dataType.value !== dataTypeValue) ||
				(!isTypedLiteral && dataTypeValue !== XsdStringIRI.value)
			) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			}
		}

		return validationResults;
	}
}
