import { ShaclShape } from '../../../../model/shacl-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { LanguageInComponentIRI, LanguageInParameterIRI } from '../../../../model/constants';
import { LangLiteral, Literal, NonBlankNode, RdfNode, RdfStore } from 'rdflib-ts';

export class LanguageInConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(LanguageInComponentIRI, [{ iri: LanguageInParameterIRI, listTaking: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let allowedLangs = constraint.get(LanguageInParameterIRI.value) as Literal[];

		for (let valueNode of valueNodes) {
			if (!(valueNode instanceof LangLiteral) || !allowedLangs.some(l => l.value === (<LangLiteral>valueNode).language 
					|| l.value === (valueNode as LangLiteral).language.replace(/-[A-Za-z]+$/, ''))) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}

		return validationResults;
	}
} 