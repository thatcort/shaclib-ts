import { ShaclShape } from '../../../model/shacl-shape';
import { ConstraintComponent } from '../constraint-component';
import { IShaclValidationResult } from '../../../model/shacl-validation-report';
import { AskComponentIRI, AskParameterIRI, PrefixesParameterIRI } from '../../../model/constants';
import { BlankNode, IRI, ISparqlQueryResult, NonBlankNode, RdfNode, RdfStore, Literal, PlainLiteral, NamespaceManagerInstance, InvalidOperationError, RdfObject } from 'rdflib-ts';

export class AskConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(AskComponentIRI, [{ iri: AskParameterIRI }, { iri: PrefixesParameterIRI, optional: true, listTaking: true, shared: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let prefixes: Literal[] = (constraint.get(PrefixesParameterIRI.value) as Literal[]) || [];
		let askQuery: PlainLiteral = constraint.get(AskParameterIRI.value) as PlainLiteral;

		let unknownPrefixes = prefixes.filter(prefix => !NamespaceManagerInstance.getNamespaceByPrefix(prefix.value.replace(/:$/g, '')));
		if (unknownPrefixes.length > 0) {
			throw new InvalidOperationError(`Namespaces for prefixes: '${unknownPrefixes.join()}' specified in constraint component are not registered in namespace manager. Make sure to add those namespaces in shacl file.`);
		}

		let prefixValues: string[] = NamespaceManagerInstance.getAllNamespaces().map(ns => `PREFIX ${ns.prefix}: <${ns.value}>`);

		for (let valueNode of valueNodes)  {
			let query = `${prefixValues.join('\n')}${askQuery.value.replace(/\$value/g, valueNode.toString())}`;
			
			let result = await dataGraph.queryAsync<any>(query);
			if (!result.boolean) {
				validationResults.push(sourceShape.createValidationResult(focusNode, valueNode, this.iri));
			}
		}
		
		return validationResults; 
	}
} 