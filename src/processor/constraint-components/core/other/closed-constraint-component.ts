import { ShaclShape } from '../../../../model/shacl-shape';
import { ShaclPropertyShape } from '../../../../model/shacl-property-shape';
import { ConstraintComponent } from '../../constraint-component';
import { ShaclValidationResult } from '../../../../model/shacl-validation-report';
import { Literal, NonBlankNode, RdfFactory, RdfNode, RdfStore, TripleQueryResult } from 'rdflib-ts';
import {
	ClosedComponentIRI,
	ClosedParameterIRI,
	IgnoredPropertiesParameterIRI,
	PropertyParameterIRI
} from '../../../../model/constants';
import { BlankNode, InvalidOperationError, IRI } from 'rdflib-ts';

export class ClosedConstraintComponent extends ConstraintComponent {
	public constructor() {
		super(ClosedComponentIRI, [
			{ iri: ClosedParameterIRI },
			{ iri: IgnoredPropertiesParameterIRI, listTaking: true, optional: true }
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

		const closedParameter = constraint.get(ClosedParameterIRI.value);
		const closedValue = (closedParameter as Literal).value;
		const ignoredPropertiesValue = constraint.get(IgnoredPropertiesParameterIRI.value);

		for (const valueNode of valueNodes) {
			if (!(valueNode instanceof BlankNode) && !(valueNode instanceof IRI)) {
				throw new InvalidOperationError(
					'Value node can not be literal for validating with ClosedConstraintComponent'
				);
			}

			if (closedValue.toLowerCase() === 'true') {
				let allowedProperties = [];

				if (ignoredPropertiesValue) {
					allowedProperties = allowedProperties.concat(ignoredPropertiesValue);
				}

				const propertyConstraints = sourceShape.constraints.filter(
					c => c.iri.value === PropertyParameterIRI.value
				);

				for (const propertyConstraint of propertyConstraints) {
					const propertyShape = propertyConstraint.value as ShaclPropertyShape;

					if (propertyShape.path.pathType === 'Sequence') {
						allowedProperties = allowedProperties.concat(
							propertyShape.path.sparqlPathString
								.split('/')
								.map(p =>
									p
										.replace('^', '')
										.replace('*', '')
										.replace('+', '')
										.replace('?', '')
								)
								.map(p => new IRI(p))
						);
					} else if (propertyShape.path.pathType === 'Alternative') {
						allowedProperties = allowedProperties.concat(
							propertyShape.path.sparqlPathString
								.split('|')
								.map(p =>
									p
										.replace('^', '')
										.replace('*', '')
										.replace('+', '')
										.replace('?', '')
								)
								.map(p => new IRI(p))
						);
					} else {
						allowedProperties.push(propertyShape.path.pathValue);
					}
				}

				allowedProperties = allowedProperties
					.map(p => p.toString())
					.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

				const filter =
					allowedProperties.length > 0
						? `filter(?predicate != ${allowedProperties.join(' && ?predicate != ')})`
						: '';

				const queryResults = await dataGraph.queryAsync<TripleQueryResult>(`
					SELECT DISTINCT ?predicate ?object 
					WHERE
					{
						${valueNode} ?predicate ?object .
						${filter}
					}
				`);

				for (const result of queryResults.results.bindings) {
					const validationResult = sourceShape.createValidationResult(
						valueNode as NonBlankNode,
						RdfFactory.createRdfTermFromSparqlResultBinding(result.object),
						this.iri
					);
					validationResult.resultPath = new IRI(result.predicate.value);

					validationResults.push(validationResult);
				}
			}
		}

		return validationResults;
	}
}
