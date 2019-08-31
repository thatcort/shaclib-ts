import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import {
	NodeKindBlankNodeOrIRIValueIRI,
	NodeKindBlankNodeOrLiteralValueIRI,
	NodeKindBlankNodeValueIRI,
	NodeKindComponentIRI
} from '../../../../model/constants';
import {
	NodeKindIRIOrLiteralValueIRI,
	NodeKindIRIValueIRI,
	NodeKindLiteralValueIRI,
	NodeKindParameterIRI
} from '../../../../model/constants';
import {
	BlankNode,
	IRI,
	NonBlankNode,
	RdfNode,
	RdfStore,
	PlainLiteral,
	LangLiteral,
	TypedLiteral,
	RdfUtils
} from 'rdflib-ts';

export class NodeKindConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(NodeKindComponentIRI, [{ iri: NodeKindParameterIRI }]);
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

		const nodeKindParameter = constraint.get(NodeKindParameterIRI.value);
		const nodeKindParameterValue = (nodeKindParameter as IRI).value;

		for (const valueNode of valueNodes) {
			switch (nodeKindParameterValue) {
				case NodeKindBlankNodeValueIRI.value: {
					if (
						!(valueNode instanceof BlankNode) &&
						!RdfUtils.isSkolemIRI(valueNode.value)
					) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
				case NodeKindIRIValueIRI.value: {
					if (!(valueNode instanceof IRI)) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
				case NodeKindLiteralValueIRI.value: {
					if (valueNode instanceof IRI || valueNode instanceof BlankNode) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
				case NodeKindBlankNodeOrIRIValueIRI.value: {
					if (
						(!(valueNode instanceof BlankNode) &&
							!RdfUtils.isSkolemIRI(valueNode.value)) ||
						!(valueNode instanceof IRI)
					) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
				case NodeKindBlankNodeOrLiteralValueIRI.value: {
					if (
						(!(valueNode instanceof BlankNode) &&
							!RdfUtils.isSkolemIRI(valueNode.value)) ||
						valueNode instanceof IRI
					) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
				case NodeKindIRIOrLiteralValueIRI.value: {
					if (
						valueNode instanceof PlainLiteral ||
						valueNode instanceof LangLiteral ||
						valueNode instanceof TypedLiteral ||
						RdfUtils.isSkolemIRI(valueNode.value)
					) {
						validationResults.push(
							sourceShape.createValidationResult(focusNode, valueNode, this.iri)
						);
					}

					break;
				}
			}
		}

		return validationResults;
	}
}
