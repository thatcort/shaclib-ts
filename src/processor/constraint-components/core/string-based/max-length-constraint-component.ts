import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxLengthComponentIRI, MaxLengthParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore, BlankNode, IRI } from 'rdflib-ts';

export class MaxLengthConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxLengthComponentIRI, [{ iri: MaxLengthParameterIRI }]);
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

		const maxLengthValue = constraint.get(MaxLengthParameterIRI.value);

		for (const valueNode of valueNodes) {
			if (
				valueNode instanceof BlankNode ||
				(valueNode instanceof IRI && /\/.well-known\/genid\//.test(valueNode.value))
			) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			} else {
				const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (STRLEN(str(${valueNode})) <= ${maxLengthValue}) 
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
