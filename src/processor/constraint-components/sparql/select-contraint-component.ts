import { ShaclShape } from '../../../model/shacl-shape';
import { ConstraintComponent } from '../constraint-component';
import { ShaclValidationResult } from '../../../model/shacl-validation-report';
import {
	SelectComponentIRI,
	SelectParameterIRI,
	PrefixesParameterIRI
} from '../../../model/constants';
import {
	NonBlankNode,
	RdfNode,
	RdfStore,
	Literal,
	PlainLiteral,
	NamespaceManagerInstance,
	InvalidOperationError
} from 'rdflib-ts';

export class SelectConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(SelectComponentIRI, [
			{ iri: SelectParameterIRI },
			{ iri: PrefixesParameterIRI, optional: true, listTaking: true, shared: true }
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
		let validationResults: ShaclValidationResult[] = [];

		const prefixes: Literal[] = (constraint.get(PrefixesParameterIRI.value) as Literal[]) || [];
		const selectQuery: PlainLiteral = constraint.get(SelectParameterIRI.value) as PlainLiteral;

		const unknownPrefixes = prefixes.filter(
			prefix =>
				!NamespaceManagerInstance.getNamespaceByPrefix(prefix.value.replace(/:$/g, ''))
		);
		if (unknownPrefixes.length > 0) {
			throw new InvalidOperationError(
				`Namespaces for prefixes: '${unknownPrefixes.join()}' specified in constraint component are not registered in namespace manager. Make sure to add those namespaces in shacl file.`
			);
		}

		const prefixValues: string[] = NamespaceManagerInstance.getAllNamespaces().map(
			ns => `PREFIX ${ns.prefix}: <${ns.value}>`
		);
		const query = `${prefixValues.join('\n')}${selectQuery.value.replace(
			/\$this/g,
			focusNode.toString()
		)}`;

		const result = await dataGraph.queryAsync<any>(query);

		validationResults = validationResults.concat(
			result.results.bindings.map(b => {
				const validationResult = sourceShape.createValidationResult(
					focusNode,
					b.value,
					this.iri
				);

				if (!validationResult.resultPath) {
					validationResult.resultPath = b.path;
				}

				return validationResult;
			})
		);

		return validationResults;
	}
}
