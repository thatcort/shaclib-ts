import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { UniqueLangComponentIRI, UniqueLangParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class UniqueLangConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(UniqueLangComponentIRI, [{ iri: UniqueLangParameterIRI }]);
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

		const uniqueLangParameter = constraint.get(UniqueLangParameterIRI.value);
		const uniqueLangValue = (uniqueLangParameter as Literal).value;

		if (uniqueLangValue.toLowerCase() === 'true') {
			const langLiterals = valueNodes.filter(
				vn => vn instanceof LangLiteral
			) as LangLiteral[];
			if (
				langLiterals.some(l =>
					langLiterals.some(ll => l !== ll && l.language === ll.language)
				)
			) {
				validationResults.push(
					sourceShape.createValidationResult(focusNode, undefined, this.iri)
				);
			}
		}

		return validationResults;
	}
}
