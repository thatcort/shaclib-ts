import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MaxLengthComponentIRI, MaxLengthParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore, BlankNode, IRI } from 'rdflib-ts';

export class MaxLengthConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MaxLengthComponentIRI, [{ iri: MaxLengthParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let maxLengthValue = constraint.get(MaxLengthParameterIRI.value);

		for (let valueNode of valueNodes) {
			if (valueNode instanceof BlankNode || (valueNode instanceof IRI && /\/.well-known\/genid\//.test(valueNode.value))) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			} else {
				let result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (STRLEN(str(${valueNode})) <= ${maxLengthValue}) 
					}
				`);

				if (!result.boolean) {
					validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
				}
			}
		}

		return validationResults;
	}
} 