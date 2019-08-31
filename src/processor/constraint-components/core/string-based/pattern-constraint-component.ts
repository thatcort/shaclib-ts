import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import {
	PatternComponentIRI,
	PatternParameterIRI,
	FlagsParameterIRI
} from '../../../../model/constants';
import { NonBlankNode, RdfNode, RdfStore, BlankNode, RdfUtils } from 'rdflib-ts';

export class PatternConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(PatternComponentIRI, [
			{ iri: PatternParameterIRI },
			{ iri: FlagsParameterIRI, optional: true }
		]);
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

		const patternValue = constraint.get(PatternParameterIRI.value);
		const flagsValue = constraint.get(FlagsParameterIRI.value);

		for (const valueNode of valueNodes) {
			if (valueNode instanceof BlankNode || RdfUtils.isSkolemIRI(valueNode.value)) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, valueNode, this.iri)
				);
			} else {
				const regexFilter = flagsValue
					? `REGEX(STR(${valueNode}), ${patternValue}, ${flagsValue})`
					: `REGEX(STR(${valueNode}), ${patternValue})`;

				const result = await dataGraph.queryAsync<any>(`
					ASK
					{
						FILTER ${regexFilter}
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
