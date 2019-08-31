import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinLengthComponentIRI, MinLengthParameterIRI } from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore, BlankNode, RdfUtils } from 'rdflib-ts';

export class MinLengthConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinLengthComponentIRI, [{ iri: MinLengthParameterIRI }]);
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

		const minLengthValue = constraint.get(MinLengthParameterIRI.value);

		for (const valueNode of valueNodes) {
			if (valueNode instanceof BlankNode || RdfUtils.isSkolemIRI(valueNode.value)) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			} else {
				const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (STRLEN(str(${valueNode})) >= ${minLengthValue}) 
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
