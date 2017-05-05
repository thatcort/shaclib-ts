import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { DatatypeComponentIRI, DatatypeParameterIRI, RdfsSubClassOfIRI, RdfTypeIRI } from '../../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore, PlainLiteral, LangLiteral, TypedLiteral, XsdStringIRI } from 'rdflib-ts';

export class DatatypeConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(DatatypeComponentIRI, [{ iri: DatatypeParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let dataTypeParameter = constraint.get(DatatypeParameterIRI.value);
		let dataTypeValue = (<IRI>dataTypeParameter).value;

		for (let valueNode of valueNodes) {
			let isTypedLiteral = valueNode instanceof TypedLiteral;

			if ((isTypedLiteral && (<TypedLiteral>valueNode).dataType.value !== dataTypeValue) || (!isTypedLiteral && dataTypeValue !== XsdStringIRI.value)) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 
