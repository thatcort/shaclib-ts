import { ShaclShape } from '../model/shacl-shape';
import { ShaclNodeShape } from '../model/shacl-node-shape';
import { ShaclPropertyShape } from '../model/shacl-property-shape';
import { CommonConstraintComponentManager } from './constraint-components/constraint-component-manager';
import { IRI, SparqlQueryResultBinding, RdfFactory, RdfStore, SparqlQueryResult } from 'rdflib-ts';
import {
	AlternativePathIRI,
	InversePathIRI,
	NodeShapeIRI,
	OneOrMorePathIRI,
	PropertyPathIRI,
	PropertyShapeIRI
} from '../model/constants';
import {
	RdfFirstIRI,
	RdfRestIRI,
	RdfsClassIRI,
	RdfTypeIRI,
	ShapeDeactivatedIRI,
	ShapeMessageIRI,
	ShapeSeverityIRI
} from '../model/constants';
import {
	TargetClassIRI,
	TargetNodeIRI,
	TargetObjectsOfIRI,
	TargetSubjectsOfIRI,
	ZeroOrMorePathIRI,
	ZeroOrOnePathIRI
} from '../model/constants';

export interface ShapeQueryResult {
	shape: SparqlQueryResultBinding;
	path?: SparqlQueryResultBinding;
	deactivated?: SparqlQueryResultBinding;
	severity?: SparqlQueryResultBinding;
	message?: SparqlQueryResultBinding;
}

export interface TargetQueryResult {
	targetNode: SparqlQueryResultBinding;
	targetClass?: SparqlQueryResultBinding;
	implicitTargetClass?: SparqlQueryResultBinding;
	targetSubjectsOf?: SparqlQueryResultBinding;
	targetObjectsOf?: SparqlQueryResultBinding;
}

export interface ConstraintQueryResult {
	constraint: SparqlQueryResultBinding;
	constraintValue?: SparqlQueryResultBinding;
}

export interface ListQueryResult {
	item: SparqlQueryResultBinding;
}

export interface PathQueryResult {
	pathType: SparqlQueryResultBinding;
	pathValue: SparqlQueryResultBinding;
}

export class ShaclShapeParser {
	public readonly options: any;

	public constructor(options = {}) {
		this.options = Object.assign({}, {}, options);
	}

	public async parseShapesAsync(shapeGraph: RdfStore): Promise<ShaclShape[]> {
		const shapes = [];

		// Extract all shapes from dataset, and put them in map for
		// easier manipulation later on
		const shapesQuery = this.buildShapesQuery();
		const shapesQueryResult = await shapeGraph.queryAsync<ShapeQueryResult>(shapesQuery);
		const shapeMap = this.createShapeMap(shapesQueryResult);

		// For each shape, parse it's properties like targets, constraints and path
		for (const shape of shapeMap.values()) {
			await this.parseShapeTargetsAsync(shape, shapeGraph);
			await this.parseShapeConstraintsAsync(shape, shapeMap, shapeGraph);

			if (shape instanceof ShaclPropertyShape) {
				await this.parseShapePathAsync(shape, shapeGraph);
			}

			shapes.push(shape);
		}

		return shapes;
	}

	private buildShapesQuery(): string {
		const constraints = CommonConstraintComponentManager.getAllConstraintParameters();
		const shapeExpectingListTakingParameters = constraints.filter(
			p => p.shapeExpecting && p.listTaking
		);
		const shapeExpectingNonListTakingParameters = constraints.filter(
			p => p.shapeExpecting && !p.listTaking
		);

		// Build sparql query that will extract all shapes from dataset
		return `
            SELECT DISTINCT ?shape ?path ?deactivated ?severity ?message
            WHERE
            {
                {
                    ?shape ?predicate ?object .
                    filter
                    (
                        (?predicate = ${RdfTypeIRI} && ?object = ${NodeShapeIRI}) ||
                        (?predicate = ${RdfTypeIRI} && ?object = ${PropertyShapeIRI}) ||
                        ?predicate = ${TargetClassIRI} ||
                        ?predicate = ${TargetNodeIRI} ||
                        ?predicate = ${TargetObjectsOfIRI} ||
                        ?predicate = ${TargetSubjectsOfIRI} ||
                        ?predicate = ${PropertyPathIRI} ||
                        ?predicate = ${constraints.map(c => c.iri).join(' || ?predicate = ')}
                    )
                }

                UNION 
                {
                    ?subject ?predicate ?shape .
                    filter(?predicate = ${shapeExpectingNonListTakingParameters
						.map(p => p.iri)
						.join(' || ?predicate = ')})
                }

                UNION 
                {
                    ?subject ?predicate ?list .
					?list ${RdfRestIRI}*/${RdfFirstIRI} ?shape .
                    filter(?predicate = ${shapeExpectingListTakingParameters
						.map(p => p.iri)
						.join(' || ?predicate = ')})
                }

                OPTIONAL
                {
                    ?shape ${PropertyPathIRI} ?path
                }

                OPTIONAL
                {
                    ?shape ${ShapeDeactivatedIRI} ?deactivated
                }

                OPTIONAL
                {
                    ?shape ${ShapeSeverityIRI} ?severity
                }

                OPTIONAL
                {
                    ?shape ${ShapeMessageIRI} ?message
                }

                OPTIONAL
                {
                    ?shape ?constraint ?constraintValue .
                    filter(?constraint = ${constraints.map(c => c.iri).join(' || ?constraint = ')})
                }
            }
        `;
	}

	private createShapeMap(
		shapesQueryResult: SparqlQueryResult<ShapeQueryResult>
	): Map<string, ShaclShape> {
		const shapeMap = new Map<string, ShaclShape>();

		for (const result of shapesQueryResult.results.bindings) {
			let shape = shapeMap.get(result.shape.value);

			if (!shape) {
				shape = result.path
					? new ShaclPropertyShape(new IRI(result.shape.value))
					: new ShaclNodeShape(new IRI(result.shape.value));
				shapeMap.set(result.shape.value, shape);
			}

			if (result.deactivated) {
				shape.deactivated = result.deactivated.value === 'true';
			}

			if (result.severity) {
				shape.severity = new IRI(result.severity.value);
			}

			if (result.message) {
				shape.messages.push(
					RdfFactory.createLiteral(
						result.message.value,
						result.message['xml:lang'],
						result.message.datatype
					)
				);
			}
		}

		return shapeMap;
	}

	private buildTargetsQuery(shapeIRI: IRI): string {
		return `
            SELECT DISTINCT ?targetNode ?targetClass ?implicitTargetClass ?targetSubjectsOf ?targetObjectsOf
            WHERE
            {
                OPTIONAL
                {
                    ${shapeIRI} ${TargetClassIRI} ?targetClass .
                }

                OPTIONAL
                {
                    ${shapeIRI} ${RdfTypeIRI} ${RdfsClassIRI} .
                    BIND(${shapeIRI} as ?implicitTargetClass)
                }

                OPTIONAL
                {
                    ${shapeIRI} ${TargetNodeIRI} ?targetNode .
                }

                OPTIONAL
                {
                    ${shapeIRI} ${TargetObjectsOfIRI} ?targetObjectsOf .
                }

                OPTIONAL
                {
                    ${shapeIRI} ${TargetSubjectsOfIRI} ?targetSubjectsOf .
                }
            }
        `;
	}

	private async parseShapeTargetsAsync(shape: ShaclShape, shapeGraph: RdfStore): Promise<any> {
		// Parse and populate shape with it's targets
		const targetsQuery = this.buildTargetsQuery(shape.iri);
		const targetsQueryResult = await shapeGraph.queryAsync<TargetQueryResult>(targetsQuery);

		for (const result of targetsQueryResult.results.bindings) {
			if (result.targetNode) {
				const targetNode =
					result.targetNode.type === 'uri'
						? new IRI(result.targetNode)
						: RdfFactory.createLiteral(
								result.targetNode.value,
								result.targetNode['xml:lang'],
								result.targetNode.datatype
						  );

				shape.targetNodes.push(targetNode);
			}

			if (result.targetClass) {
				shape.targetClasses.push(new IRI(result.targetClass.value));
			}

			if (result.implicitTargetClass) {
				shape.targetClasses.push(new IRI(result.implicitTargetClass.value));
			}

			if (result.targetSubjectsOf) {
				shape.targetSubjectsOf.push(new IRI(result.targetSubjectsOf.value));
			}

			if (result.targetObjectsOf) {
				shape.targetObjectsOf.push(new IRI(result.targetObjectsOf.value));
			}
		}
	}

	private buildConstraintsQuery(shapeIRI: IRI): string {
		const constraints = CommonConstraintComponentManager.getAllConstraintParameters();

		return `
            SELECT DISTINCT ?constraint ?constraintValue
            WHERE
            {
                ${shapeIRI} ?constraint ?constraintValue .
                filter(?constraint = ${constraints.map(c => c.iri).join('|| ?constraint = ')})
            }
        `;
	}

	private buildListQuery(listIRI: IRI): string {
		return `
            SELECT ?item 
            WHERE
            {
                ${listIRI} ${RdfRestIRI}*/${RdfFirstIRI} ?item .
            }
        `;
	}

	private async parseShapeConstraintsAsync(
		shape: ShaclShape,
		shapeMap: Map<string, ShaclShape>,
		shapeGraph: RdfStore
	): Promise<any> {
		// Parse  constraints declared by shape
		const constraintsQuery = this.buildConstraintsQuery(shape.iri);
		const constraintsQueryResult = await shapeGraph.queryAsync<ConstraintQueryResult>(
			constraintsQuery
		);

		for (const result of constraintsQueryResult.results.bindings) {
			const constraintIRI = new IRI(result.constraint.value);
			const constraintParameter = CommonConstraintComponentManager.getConstraintParameterByIRI(
				constraintIRI
			);

			let constraintValue: any;

			if (constraintParameter.listTaking) {
				constraintValue = [];

				const listQuery = this.buildListQuery(new IRI(result.constraintValue.value));
				const listQueryResults = await shapeGraph.queryAsync<ListQueryResult>(listQuery);

				for (const element of listQueryResults.results.bindings) {
					if (constraintParameter.shapeExpecting) {
						const childShape = shapeMap.get(element.item.value);
						childShape.isChildShape = true;

						this.resolveChildShapeTargets(shape, childShape);
						constraintValue.push(childShape);
					} else {
						constraintValue.push(
							RdfFactory.createRdfTermFromSparqlResultBinding(element.item)
						);
					}
				}
			} else {
				if (constraintParameter.shapeExpecting) {
					const childShape = shapeMap.get(result.constraintValue.value);
					childShape.isChildShape = true;

					this.resolveChildShapeTargets(shape, childShape);
					constraintValue = childShape;
				} else {
					constraintValue = RdfFactory.createRdfTermFromSparqlResultBinding(
						result.constraintValue
					);
				}
			}

			shape.constraints.push({
				iri: constraintIRI,
				value: constraintValue
			});
		}
	}

	private resolveChildShapeTargets(shape: ShaclShape, childShape: ShaclShape): void {
		if (
			childShape.targetClasses.length === 0 &&
			childShape.targetNodes.length === 0 &&
			childShape.targetObjectsOf.length === 0 &&
			childShape.targetSubjectsOf.length === 0
		) {
			childShape.targetClasses = shape.targetClasses;
			childShape.targetNodes = shape.targetNodes;
			childShape.targetObjectsOf = shape.targetObjectsOf;
			childShape.targetSubjectsOf = shape.targetSubjectsOf;
		}
	}

	private buildPathQuery(shapeIRI: IRI): string {
		return `
            SELECT DISTINCT ?pathType ?pathValue 
            WHERE
            {
                ${shapeIRI} ${PropertyPathIRI} ?x .
                
                OPTIONAL
                {
                    ${shapeIRI} ${PropertyPathIRI} ?x 
                    MINUS { ?x ${AlternativePathIRI} ?o }
                    MINUS { ?x ${InversePathIRI} ?o }
                    MINUS { ?x ${ZeroOrMorePathIRI} ?o }
                    MINUS { ?x ${ZeroOrOnePathIRI} ?o }
                    MINUS { ?x ${OneOrMorePathIRI} ?o }
                    BIND(IF(CONTAINS(STR(?x), "/.well-known/genid/") = true, "Sequence", "Predicate") as ?pathType )
                    BIND(?x as ?pathValue)       
                }
                
                OPTIONAL
                {
                    ?x ${AlternativePathIRI} ?pathValue .
                    BIND("Alternate" as ?pathType)
                }

                OPTIONAL
                {
                    ?x ${InversePathIRI} ?pathValue .
                    BIND("Inverse" as ?pathType)
                }

                OPTIONAL
                {
                    ?x ${ZeroOrMorePathIRI} ?pathValue .
                    BIND("ZeroOrMore" as ?pathType)
                }

                OPTIONAL
                {
                    ?x ${OneOrMorePathIRI} ?pathValue .
                    BIND("OneOrMore" as ?pathType)
                }

                OPTIONAL
                {
                    ?x ${ZeroOrOnePathIRI} ?pathValue .
                    BIND("ZeroOrOne" as ?pathType)
                }
            }
        `;
	}

	private buildSequencePathQuery(sequencePathIRI: IRI): string {
		return `
            SELECT ?pathType ?pathValue
            WHERE
            {
                ${sequencePathIRI} ${RdfRestIRI}*/${RdfFirstIRI} ?path.

                OPTIONAL
                {
                    ${sequencePathIRI} ${RdfRestIRI}*/${RdfFirstIRI} ?path.
                    MINUS { ?path ${AlternativePathIRI} ?o }
                    MINUS { ?path ${InversePathIRI} ?o }
                    MINUS { ?path ${ZeroOrMorePathIRI} ?o }
                    MINUS { ?path ${ZeroOrOnePathIRI} ?o }
                    MINUS { ?path ${OneOrMorePathIRI} ?o }
                    BIND("Predicate" as ?pathType)
                    BIND(?path as ?pathValue)       
                }
                
                OPTIONAL
                {
                    ?path ${AlternativePathIRI} ?pathValue .
                    BIND("Alternate" as ?pathType)
                }

                OPTIONAL
                {
                    ?path ${InversePathIRI} ?pathValue .
                    BIND("Inverse" as ?pathType)
                }

                OPTIONAL
                {
                    ?path ${ZeroOrMorePathIRI} ?pathValue .
                    BIND("ZeroOrMore" as ?pathType)
                }

                OPTIONAL
                {
                    ?path ${OneOrMorePathIRI} ?pathValue .
                    BIND("OneOrMore" as ?pathType)
                }

                OPTIONAL
                {
                    ?path ${ZeroOrOnePathIRI} ?pathValue .
                    BIND("ZeroOrOne" as ?pathType)
                }
            }
        `;
	}

	private async parseShapePathAsync(
		shape: ShaclPropertyShape,
		shapeGraph: RdfStore
	): Promise<any> {
		const pathQuery = this.buildPathQuery(shape.iri);
		const pathQueryResult = await shapeGraph.queryAsync<PathQueryResult>(pathQuery);

		const pathType = pathQueryResult.results.bindings[0].pathType.value;
		const pathValue = pathQueryResult.results.bindings[0].pathValue.value;

		shape.path.pathValue = new IRI(pathValue);
		shape.path.pathType = pathType;

		if (pathType === 'Sequence' || pathType === 'Alternative') {
			const sequencePathQuery = this.buildSequencePathQuery(new IRI(pathValue));
			const sequencePathQueryResult = await shapeGraph.queryAsync<PathQueryResult>(
				sequencePathQuery
			);

			const stringBuilder = [];

			for (let i = 0; i < sequencePathQueryResult.results.bindings.length; i++) {
				stringBuilder.push(this.resolveSparqlPathString(shape, pathType));
			}

			shape.path.sparqlPathString = stringBuilder.join(pathType === 'Sequence' ? '/' : '|');
		} else {
			shape.path.sparqlPathString = this.resolveSparqlPathString(shape, pathType);
		}
	}

	private resolveSparqlPathString(shape: ShaclPropertyShape, pathType: string): string {
		switch (pathType) {
			case 'Predicate':
				return `${shape.path.pathValue}`;
			case 'Inverse':
				return `^${shape.path.pathValue}`;
			case 'ZeroOrMore':
				return `${shape.path.pathValue}*`;
			case 'OneOrMore':
				return `${shape.path.pathValue}+`;
			case 'ZeroOrOne':
				return `${shape.path.pathValue}?`;
			default:
				return null;
		}
	}
}
