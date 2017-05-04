import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { UniqueLangComponentIRI, UniqueLangParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore, BlankNode, IRI, RdfUtils } from 'rdflib-ts';

export class UniqueLangConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(UniqueLangComponentIRI, [{ iri: UniqueLangParameterIRI, listTaking: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let uniqueLangParameter = constraint.get(UniqueLangParameterIRI.value);
		let uniqueLangValue = (uniqueLangParameter as Literal).value;

		if (uniqueLangValue.toLowerCase() === 'true') {
			let langLiterals = valueNodes.filter(vn => vn instanceof LangLiteral) as LangLiteral[];
			let multiLangLiterals = langLiterals.filter(ll => langLiterals.filter(literal => literal.language === ll.language).length > 1);

			for (let literal of multiLangLiterals) {
				validationResults.push(sourceShape.createValidationResult(focusNode, literal, this.iri));
			}
		}

		return validationResults;
	}
} 