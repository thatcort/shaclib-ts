import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import {
	ClassComponentIRI,
	ClassParameterIRI,
	RdfsSubClassOfIRI,
	RdfTypeIRI
} from '../../../../model/constants';
import { BlankNode, IRI, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class ClassConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(ClassComponentIRI, [{ iri: ClassParameterIRI }]);
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

		const classParameterValue = constraint.get(ClassParameterIRI.value);

		for (const valueNode of valueNodes) {
			if (!(valueNode instanceof IRI) && !(valueNode instanceof BlankNode)) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			} else {
				const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						${valueNode} ${RdfTypeIRI}/${RdfsSubClassOfIRI}*${classParameterValue}
					}
				`);

				if (!result.boolean) {
					validationResults.push(
						sourceShape.createValidationResult(focusNode, valueNode, this.iri)
					);
				}
			}
		}

		return validationResults;
	}
}
