import { ShaclShape } from '../model/shacl-shape';
import { ShaclPropertyShape } from '../model/shacl-property-shape';
import { ConstraintComponent } from './constraint-components/constraint-component';
import { RdfsSubClassOfIRI, RdfTypeIRI } from '../model/constants';
import { CommonConstraintComponentManager } from './constraint-components/constraint-component-manager';
import { IShaclValidationResult, ShaclValidationReport } from '../model/shacl-validation-report';
import { ITripleQueryResult, NonBlankNode, RdfFactory, RdfNode, RdfStore } from 'rdflib-ts';
import { IRI, ISparqlQueryResult, ISparqlQueryResultBinding, BlankNode, RdfTerm } from 'rdflib-ts';

export interface IShaclValidationOptions {
}

export interface IFocusNodeQueryResult {
	focusNode: ISparqlQueryResultBinding
}

export class ShaclValidator {
	public readonly options: IShaclValidationOptions;

	public constructor(options: IShaclValidationOptions = {}) {
		this.options = Object.assign({}, {}, options);
	}

	public async validateAsync(shapes: ShaclShape[], dataGraph: RdfStore): Promise<ShaclValidationReport> {
		let report = new ShaclValidationReport();

		for (let shape of shapes) {
			if (!shape.isChildShape && !shape.deactivated) {
				let results = await this.validateShape(shapes, shape, dataGraph);
				report.results = report.results.concat(results);
			}
		}

		report.conforms = report.results.length === 0;
		return report;
	}

	public async validateShape(shapes: ShaclShape[], shape: ShaclShape, dataGraph: RdfStore, focusNodes?: NonBlankNode[]): Promise<IShaclValidationResult[]> {
		let validationResults: IShaclValidationResult[] = [];

		if (!focusNodes) {
			focusNodes = await this.resolveFocusNodes(shape, dataGraph);
		}

		let constraintComponentMap = this.buildConstraintComponentMap(shape);

		for (let focusNode of focusNodes) {

			let valueNodes = shape instanceof ShaclPropertyShape ? await this.resolveValueNodes(focusNode, shape.path.sparqlPathString, dataGraph) : [focusNode];

			for (let component of constraintComponentMap.entries()) {

				let results = [];

				if (component[1].size > 1) {
					let tmpMap = new Map<string, any>();

					for (let entry of component[1].entries()) {
						tmpMap.set(entry[0], entry[1][0]);
					}

					results = results.concat(await component[0].validateAsync(shapes, shape, dataGraph, focusNode, valueNodes, tmpMap));
				} else {
					for (let entry of component[1].entries()) {
						for (let parameterValue of entry[1]) {
							let tmpMap = new Map<string, any>();
							tmpMap.set(entry[0], parameterValue);

							results = results.concat(await component[0].validateAsync(shapes, shape, dataGraph, focusNode, valueNodes, tmpMap));
						}
					}
				}

				validationResults = validationResults.concat(results);
			}
		}

		return validationResults;
	}

	private async resolveFocusNodes(shape: ShaclShape, dataGraph: RdfStore): Promise<NonBlankNode[]> {
		let focusNodes = [].concat(shape.targetNodes);

		if (shape.targetClasses.length > 0) {
			let targetClassQuery = this.buildTargetClassQuery(shape.targetClasses);
			let targetClassQueryResults = await dataGraph.queryAsync<IFocusNodeQueryResult>(targetClassQuery);

			focusNodes = focusNodes.concat(targetClassQueryResults.results.bindings.map(r => this.createRdfTermFromSparqlBinding(r.focusNode)));
		}


		if (shape.targetSubjectsOf.length > 0) {
			let targetSubjectsOfQuery = this.buildTargetSubjectsOfQuery(shape.targetSubjectsOf);
			let targetSubjectsOfQueryResults = await dataGraph.queryAsync<IFocusNodeQueryResult>(targetSubjectsOfQuery);

			focusNodes = focusNodes.concat(targetSubjectsOfQueryResults.results.bindings.map(r => this.createRdfTermFromSparqlBinding(r.focusNode)));
		}

		if (shape.targetObjectsOf.length > 0) {
			let targetObjectsOfQuery = this.buildTargetObjectsOfQuery(shape.targetObjectsOf);
			let targetObjectsOfQueryResults = await dataGraph.queryAsync<IFocusNodeQueryResult>(targetObjectsOfQuery);

			focusNodes = focusNodes.concat(targetObjectsOfQueryResults.results.bindings.map(r => this.createRdfTermFromSparqlBinding(r.focusNode)));
		}

		return focusNodes;
	}

	private async resolveValueNodes(focusNode: NonBlankNode, path: string, dataGraph: RdfStore): Promise<RdfNode[]> {
		let valueNodesQuery = this.buildValueNodesQuery(focusNode, path);
		let valueNodesQueryResults = await dataGraph.queryAsync<ITripleQueryResult>(valueNodesQuery);

		return valueNodesQueryResults.results.bindings.map(r => this.createRdfTermFromSparqlBinding(r.object));
	}

	private buildTargetClassQuery(targetClasses: IRI[]): string {

		let filter = targetClasses.length > 0 ? `filter(?targetClass = ${targetClasses.join(' || ?targetClass = ')})` : '';

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

		let filter = targetSubjectsOf.length > 0 ? `filter(?predicate = ${targetSubjectsOf.join(' || ?predicate = ')})` : '';

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

		let filter = targetObjectsOf.length > 0 ? `filter(?predicate = ${targetObjectsOf.join(' || ?predicate = ')})` : '';

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

	private buildConstraintComponentMap(shape: ShaclShape): Map<ConstraintComponent, Map<string, any[]>> {
		let constraintComponentMap = new Map<ConstraintComponent, Map<string, any>>();

		for (let constraint of shape.constraints) {
			let component = CommonConstraintComponentManager.getConstraintComponentByParameter(constraint.iri);

			if (!constraintComponentMap.has(component)) {
				constraintComponentMap.set(component, new Map<string, any[]>());
			}

			let parameterMap = constraintComponentMap.get(component);

			if (!parameterMap.has(constraint.iri.value)) {
				parameterMap.set(constraint.iri.value, []);
			}

			parameterMap.get(constraint.iri.value).push(constraint.value);
		}

		return constraintComponentMap;
	}

	private createRdfTermFromSparqlBinding(binding: ISparqlQueryResultBinding): RdfTerm {
        switch (binding.type) {
            case 'uri': return new IRI(binding.value);
            case 'bnode': return new BlankNode(binding.value);
            default: return RdfFactory.createLiteral(binding.value, binding['xml:lang'], binding.datatype);
        }
    }
}