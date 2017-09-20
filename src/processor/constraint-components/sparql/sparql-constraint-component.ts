import { IShaclConstraint } from '../../../model/shacl-constraint';
import { ShaclShape } from '../../../model/shacl-shape';
import { ShaclValidator } from '../../shacl-validator'
import { ShaclNodeShape } from '../../../model/shacl-node-shape';
import { ConstraintComponent } from '../constraint-component';
import { IShaclValidationResult } from '../../../model/shacl-validation-report';
import { SparqlComponentIRI, SparqlParameterIRI, SelectParameterIRI, AskParameterIRI } from '../../../model/constants';
import { InvalidOperationError, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore, XsdIntegerIRI, TypedLiteral, PlainLiteral, NamespaceManagerInstance } from 'rdflib-ts';

export class SparqlConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(SparqlComponentIRI, [{ iri: SparqlParameterIRI, shapeExpecting: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let sparqlShape = constraint.get(SparqlParameterIRI.value) as ShaclShape;

		let selectConstraint: IShaclConstraint = sparqlShape.constraints.find(c => c.iri.value === SelectParameterIRI.value);
		let askConstraint: IShaclConstraint = sparqlShape.constraints.find(c => c.iri.value === AskParameterIRI.value);

		if (!selectConstraint && !askConstraint) {
			throw new InvalidOperationError(`SparqlConstraintComponent '${sparqlShape.iri}' does not declare sh:select nor sh:ask constraint`);
		}
		
		let prefixValues: string[] = NamespaceManagerInstance.getAllNamespaces().map(ns => `PREFIX ${ns.prefix}: <${ns.value}>`);

		let query = selectConstraint ? selectConstraint.value : askConstraint.value;

		let query = `${prefixValues.join('\n')}${selectQuery.value.replace(/(SELECT.*?)\$this/g, '$1').replace(/\$this/g, focusNode.toString())}`;
		
		return validationResults;
	}
} 