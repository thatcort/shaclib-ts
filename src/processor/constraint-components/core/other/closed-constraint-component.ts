import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { IShaclValidationResult } from '../../../../model/shacl-validation-report';
import { ITripleQueryResult, Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';
import { ClosedComponentIRI, ClosedParameterIRI, IgnoredPropertiesParameterIRI, PropertyParameterIRI } from '../../../../model/constants';
import { ISparqlQueryResultBinding, RdfTerm, BlankNode, InvalidOperationError, IRI, ISparqlQueryResult } from 'rdflib-ts';


export class ClosedConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(ClosedComponentIRI, [{ iri: ClosedParameterIRI }, { iri: IgnoredPropertiesParameterIRI, listTaking: true, optional: true }])
	}

	public async validateAsync(shapes: ShaclShape[], sourceShape: ShaclShape, dataGraph: RdfStore, focusNode: NonBlankNode, valueNodes: RdfNode[], constraint: Map<string, any>): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		let closedParameter = constraint.get(ClosedParameterIRI.value);
		let closedValue = (closedParameter as Literal).value;
		let ignoredPropertiesValue = constraint.get(IgnoredPropertiesParameterIRI.value);

		for (let valueNode of valueNodes) {
			if (!(valueNode instanceof BlankNode) && !(valueNode instanceof IRI)) {
				throw new InvalidOperationError('Value node can not be literal for validating with ClosedConstraintComponent');
			}

			if (closedValue.toLowerCase() === 'true') {
				let allowedProperties = [];

				if (ignoredPropertiesValue) {
					allowedProperties = allowedProperties.concat(ignoredPropertiesValue);
				}

				let propertyConstraints = sourceShape.constraints.filter(c => c.iri.value === PropertyParameterIRI.value);

				for (let propertyConstraint of propertyConstraints) {
					let propertyShape = propertyConstraint.value as ShaclPropertyShape;

					if (propertyShape.path.pathType === 'Sequence') {
						allowedProperties = allowedProperties.concat(propertyShape.path.sparqlPathString.split('/')
							.map(p => p.replace('^', '').replace('*', '').replace('+', '').replace('?', ''))
							.map(p => new IRI(p)));
					} else if (propertyShape.path.pathType === 'Alternative') {
						allowedProperties = allowedProperties.concat(propertyShape.path.sparqlPathString.split('|')
							.map(p => p.replace('^', '').replace('*', '').replace('+', '').replace('?', ''))
							.map(p => new IRI((p))));
					} else {
						allowedProperties.push(propertyShape.path.pathValue);
					}
				}

				allowedProperties = allowedProperties.map(p => p.toString()).filter((elem, pos, arr) => arr.indexOf(elem) === pos);

				let filter = allowedProperties.length > 0 ? `filter(?predicate != ${allowedProperties.join(' && ?predicate != ')})` : '';

				let queryResults = await dataGraph.queryAsync<ITripleQueryResult>(`
					SELECT DISTINCT ?predicate ?object 
					WHERE
					{
						${valueNode} ?predicate ?object .
						${filter}
					}
				`);

				for (let result of queryResults.results.bindings) {
					let validationResult = sourceShape.createValidationResult(<NonBlankNode>valueNode, RdfFactory.createRdfTermFromSparqlResultBinding(result.object), this.iri);
					validationResult.resultPath = new IRI(result.predicate.value);

					validationResults.push(validationResult);
				}
			}
		}

		return validationResults;
	}
} 