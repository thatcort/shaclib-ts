import { ShaclShape } from '../model/shacl-shape';
import { ShaclPropertyShape } from '../model/shacl-property-shape';
import { ConstraintComponent } from './constraint-components/constraint-component';
import { RdfsSubClassOfIRI, RdfTypeIRI } from '../model/constants';
import { CommonConstraintComponentManager } from './constraint-components/constraint-component-manager';
import { ShaclValidationResult, ShaclValidationReport } from '../model/shacl-validation-report';
import {
	TripleQueryResult,
	NonBlankNode,
	RdfFactory,
	RdfNode,
	RdfStore,
	SparqlQueryResultBinding
} from 'rdflib-ts';
import { IRI } from 'rdflib-ts';
import { ShaclConstraint } from '../model/shacl-constraint';

export interface FocusNodeQueryResult {
	focusNode: SparqlQueryResultBinding;
}

export class ShaclValidator {
	public readonly options: any;

	public constructor(options = {}) {
		this.options = Object.assign({}, {}, options);
	}

	public async validateAsync(
		shapes: ShaclShape[],
		dataGraph: RdfStore
	): Promise<ShaclValidationReport> {
		const report = new ShaclValidationReport();

		for (const shape of shapes) {
			if (!shape.isChildShape && !shape.deactivated) {
				const results = await this.validateShape(shapes, shape, dataGraph);
				report.results = report.results.concat(results);
			}
		}

		report.conforms = !report.results.some(r =>
			/violation/gi.test(r.resultSeverity.relativeValue)
		);
		return report;
	}

	public async validateShape(
		shapes: ShaclShape[],
		shape: ShaclShape,
		dataGraph: RdfStore,
		focusNodes?: NonBlankNode[]
	): Promise<ShaclValidationResult[]> {
		let validationResults: ShaclValidationResult[] = [];

		if (!focusNodes) {
			focusNodes = await this.resolveFocusNodes(shape, dataGraph);
		}

		const constraintComponentMap = this.buildConstraintComponentMap(shape);

		for (const focusNode of focusNodes) {
			const valueNodes =
				shape instanceof ShaclPropertyShape
					? await this.resolveValueNodes(
							focusNode,
							shape.path.sparqlPathString,
							dataGraph
					  )
					: [focusNode];

			for (const component of constraintComponentMap.entries()) {
				let results = [];

				for (const constraint of component[1]) {
					results = results.concat(
						await component[0].validateAsync(
							shapes,
							shape,
							dataGraph,
							focusNode,
							valueNodes,
							constraint
						)
					);
				}

				validationResults = validationResults.concat(results);
			}
		}

		return validationResults;
	}

	private async resolveFocusNodes(
		shape: ShaclShape,
		dataGraph: RdfStore
	): Promise<NonBlankNode[]> {
		let focusNodes = [].concat(shape.targetNodes);

		if (shape.targetClasses.length > 0) {
			const targetClassQuery = this.buildTargetClassQuery(shape.targetClasses);
			const targetClassQueryResults = await dataGraph.queryAsync<FocusNodeQueryResult>(
				targetClassQuery
			);

			focusNodes = focusNodes.concat(
				targetClassQueryResults.results.bindings.map(r =>
					RdfFactory.createRdfTermFromSparqlResultBinding(r.focusNode)
				)
			);
		}

		if (shape.targetSubjectsOf.length > 0) {
			const targetSubjectsOfQuery = this.buildTargetSubjectsOfQuery(shape.targetSubjectsOf);
			const targetSubjectsOfQueryResults = await dataGraph.queryAsync<FocusNodeQueryResult>(
				targetSubjectsOfQuery
			);

			focusNodes = focusNodes.concat(
				targetSubjectsOfQueryResults.results.bindings.map(r =>
					RdfFactory.createRdfTermFromSparqlResultBinding(r.focusNode)
				)
			);
		}

		if (shape.targetObjectsOf.length > 0) {
			const targetObjectsOfQuery = this.buildTargetObjectsOfQuery(shape.targetObjectsOf);
			const targetObjectsOfQueryResults = await dataGraph.queryAsync<FocusNodeQueryResult>(
				targetObjectsOfQuery
			);

			focusNodes = focusNodes.concat(
				targetObjectsOfQueryResults.results.bindings.map(r =>
					RdfFactory.createRdfTermFromSparqlResultBinding(r.focusNode)
				)
			);
		}

		return focusNodes;
	}

	private async resolveValueNodes(
		focusNode: NonBlankNode,
		path: string,
		dataGraph: RdfStore
	): Promise<RdfNode[]> {
		const valueNodesQuery = this.buildValueNodesQuery(focusNode, path);
		const valueNodesQueryResults = await dataGraph.queryAsync<TripleQueryResult>(
			valueNodesQuery
		);

		return valueNodesQueryResults.results.bindings.map(r =>
			RdfFactory.createRdfTermFromSparqlResultBinding(r.object)
		);
	}

	private buildTargetClassQuery(targetClasses: IRI[]): string {
		const filter =
			targetClasses.length > 0
				? `filter(?targetClass = ${targetClasses.join(' || ?targetClass = ')})`
				: '';

		return `
			SELECT DISTINCT ?focusNode 
			WHERE
			{
				?focusNode ${RdfTypeIRI}/${RdfsSubClassOfIRI}* ?targetClass .
				${filter}
			}
		`;
	}

	private buildTargetSubjectsOfQuery(targetSubjectsOf: IRI[]): string {
		const filter =
			targetSubjectsOf.length > 0
				? `filter(?predicate = ${targetSubjectsOf.join(' || ?predicate = ')})`
				: '';

		return `
			SELECT DISTINCT ?focusNode 
			WHERE
			{
				?focusNode ?predicate ?object .
				${filter}
			}
		`;
	}

	private buildTargetObjectsOfQuery(targetObjectsOf: IRI[]): string {
		const filter =
			targetObjectsOf.length > 0
				? `filter(?predicate = ${targetObjectsOf.join(' || ?predicate = ')})`
				: '';

		return `
			SELECT DISTINCT ?focusNode 
			WHERE
			{
				?subject ?predicate ?focusNode .
				${filter}
			}
		`;
	}

	private buildValueNodesQuery(focusNode: NonBlankNode, path: string): string {
		return `
			SELECT ?object
			WHERE
			{
				${focusNode} ${path} ?object .
			}
		`;
	}

	private buildConstraintComponentMap(
		shape: ShaclShape
	): Map<ConstraintComponent, Map<string, any>[]> {
		const constraintComponentMap = new Map<ConstraintComponent, Map<string, any>[]>();

		const sharedConstraints: ShaclConstraint[] = [];
		for (const constraint of shape.constraints) {
			const parameter = CommonConstraintComponentManager.getConstraintParameterByIRI(
				constraint.iri
			);
			if (parameter.shared) {
				sharedConstraints.push(constraint);
				continue;
			}

			const component = CommonConstraintComponentManager.getConstraintComponentByParameter(
				constraint.iri
			);

			if (!constraintComponentMap.has(component)) {
				constraintComponentMap.set(component, []);
			}

			const parameterMaps = constraintComponentMap.get(component);

			if (component.parameters.length === 1 || parameterMaps.length === 0) {
				const constraintMap = new Map<string, any>();
				constraintMap.set(constraint.iri.value, constraint.value);
				parameterMaps.push(constraintMap);
			} else {
				parameterMaps[0].set(constraint.iri.value, constraint.value);
			}
		}

		for (const sharedConstraint of sharedConstraints) {
			for (const entry of constraintComponentMap.entries()) {
				const component = entry[0];
				const parameterMaps = entry[1];

				if (!component.parameters.some(p => p.iri.value === sharedConstraint.iri.value)) {
					continue;
				}

				if (component.parameters.length === 1 || parameterMaps.length === 0) {
					const constraintMap = new Map<string, any>();
					constraintMap.set(sharedConstraint.iri.value, sharedConstraint.value);
					parameterMaps.push(constraintMap);
				} else {
					parameterMaps[0].set(sharedConstraint.iri.value, sharedConstraint.value);
				}
			}
		}

		return constraintComponentMap;
	}
}
