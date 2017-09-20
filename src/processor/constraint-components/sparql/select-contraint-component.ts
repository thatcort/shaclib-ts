import { ShaclShape } from '../../../model/shacl-shape';
import { ConstraintComponent } from '../constraint-component';
import { IShaclValidationResult } from '../../../model/shacl-validation-report';
import { SelectComponentIRI, SelectParameterIRI, PrefixesParameterIRI } from '../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore, Literal, PlainLiteral, NamespaceManagerInstance, InvalidOperationError } from 'rdflib-ts';

export class SelectConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(SelectComponentIRI, [{ iri: PrefixesParameterIRI, optional: true, listTaking: true }, { iri: SelectParameterIRI }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let prefixes: Literal[] = (constraint.get(PrefixesParameterIRI.value) as Literal[]) || [];
		let selectQuery: PlainLiteral = constraint.get(SelectParameterIRI.value) as PlainLiteral;

		let unknownPrefixes = prefixes.filter(prefix => !NamespaceManagerInstance.getNamespaceByPrefix(prefix.value.replace(/:$/g, '')));
		if (unknownPrefixes.length > 0) {
			throw new InvalidOperationError(`Namespaces for prefixes: '${unknownPrefixes.join()}' specified in constraint component are not registered in namespace manager. Make sure to add those namespaces in shacl file.`);
		}

		let prefixValues: string[] = NamespaceManagerInstance.getAllNamespaces().map(ns => `PREFIX ${ns.prefix}: <${ns.value}>`);
		let query = `${prefixValues.join('\n')}${selectQuery.value.replace(/(SELECT.*?)\$this/g, '$1').replace(/\$this/g, focusNode.toString())}`;

		let result = await dataGraph.queryAsync<any>(query);

		validationResults = validationResults.concat(result.results.bindings.map(b => {
			let validationResult = sourceShape.createValidationResult(focusNode, b.value, this.iri);

			if (!validationResult.resultPath) {
				validationResult.resultPath = b.path;
			}

			return validationResult;
		}));
		
		return validationResults; 
	}
} 