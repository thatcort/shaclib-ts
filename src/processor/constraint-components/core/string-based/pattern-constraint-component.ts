import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { PatternComponentIRI, PatternParameterIRI, FlagsParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore, BlankNode, IRI, RdfUtils } from 'rdflib-ts';

export class PatternConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(PatternComponentIRI, [{ iri: PatternParameterIRI }, { iri: FlagsParameterIRI, optional: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let patternValue =  constraint.get(PatternParameterIRI.value);
		let flagsValue = constraint.get(FlagsParameterIRI.value);

		for (let valueNode of valueNodes) {
			if (valueNode instanceof BlankNode || RdfUtils.isSkolemIRI(valueNode.value)) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			} else {
				let regexFilter = flagsValue ? `REGEX(STR(${valueNode}), ${patternValue}, ${flagsValue})` : `REGEX(STR(${valueNode}), ${patternValue})`;

				let result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER ${regexFilter}
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