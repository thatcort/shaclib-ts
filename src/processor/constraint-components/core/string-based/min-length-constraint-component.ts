import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { MinLengthComponentIRI, MinLengthParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore, BlankNode, IRI, RdfUtils } from 'rdflib-ts';

export class MinLengthConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(MinLengthComponentIRI, [{ iri: MinLengthParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let minLengthValue = constraint.get(MinLengthParameterIRI.value);

		for (let valueNode of valueNodes) {
			if (valueNode instanceof BlankNode || RdfUtils.isSkolemIRI(valueNode.value)) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			} else {
				let result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER (STRLEN(str(${valueNode})) >= ${minLengthValue}) 
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