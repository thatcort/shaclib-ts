import { ShaclConstraint } from './shacl-constraint';
import { ViolationSeverityIRI } from './constants';
import { ShaclValidationResult } from './shacl-validation-report';
import { IRI, BlankNode, Literal, NonBlankNode, RdfTerm } from 'rdflib-ts';

export abstract class ShaclShape {
	public iri: IRI;
	public isChildShape: boolean;
	public targetClasses: IRI[];
	public targetNodes: NonBlankNode[];
	public targetObjectsOf: IRI[];
	public targetSubjectsOf: IRI[];
	public constraints: ShaclConstraint[];
	public deactivated: boolean;
	public messages: Literal[];
	public severity: IRI;

	public constructor(iri: IRI) {
		this.iri = iri;
		this.isChildShape = false;
		this.targetClasses = [];
		this.targetNodes = [];
		this.targetObjectsOf = [];
		this.targetSubjectsOf = [];
		this.constraints = [];
		this.messages = [];
		this.deactivated = false;
		this.severity = ViolationSeverityIRI;
	}

	public createValidationResult(
		focusNode: NonBlankNode,
		value?: RdfTerm,
		sourceConstraintComponent?: IRI
	): ShaclValidationResult {
		return {
			resultId: new BlankNode(),
			focusNode: focusNode,
			resultSeverity: this.severity,
			resultMessages: this.messages,
			sourceConstraintComponent: sourceConstraintComponent,
			sourceShape: this.iri,
			value: value,
			details: []
		};
	}
}
