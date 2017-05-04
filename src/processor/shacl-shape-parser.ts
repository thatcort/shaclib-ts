import { ShaclShape } from '../model/shacl-shape';
import { ShaclNodeShape } from '../model/shacl-node-shape';
import { ShaclPropertyShape } from '../model/shacl-property-shape';
import { BlankNode, RdfTerm } from 'rdflib-ts/lib';
import { CommonConstraintComponentManager } from './constraint-components/constraint-component-manager';
import { IRI, ISparqlQueryResult, ISparqlQueryResultBinding, Literal, NonBlankNode, RdfFactory, RdfStore } from 'rdflib-ts';
import { AlternativePathIRI, InversePathIRI, NodeShapeIRI, OneOrMorePathIRI, PropertyPathIRI, PropertyShapeIRI } from '../model/constants';
import { RdfFirstIRI, RdfRestIRI, RdfsClassIRI, RdfTypeIRI, ShapeDeactivatedIRI, ShapeMessageIRI, ShapeSeverityIRI } from '../model/constants';
import { TargetClassIRI, TargetNodeIRI, TargetObjectsOfIRI, TargetSubjectsOfIRI, ZeroOrMorePathIRI, ZeroOrOnePathIRI } from '../model/constants';


export interface IShapeParsingOptions {

}

export interface IShapeQueryResult {
    shape: ISparqlQueryResultBinding,
    path?: ISparqlQueryResultBinding,
    deactivated?: ISparqlQueryResultBinding,
    severity?: ISparqlQueryResultBinding,
    message?: ISparqlQueryResultBinding
}

export interface ITargetQueryResult {
    targetNode: ISparqlQueryResultBinding,
    targetClass?: ISparqlQueryResultBinding,
    implicitTargetClass?: ISparqlQueryResultBinding,
    targetSubjectsOf?: ISparqlQueryResultBinding,
    targetObjectsOf?: ISparqlQueryResultBinding
}

export interface IConstraintQueryResult {
    constraint: ISparqlQueryResultBinding,
    constraintValue?: ISparqlQueryResultBinding
}

export interface IListQueryResult {
    item: ISparqlQueryResultBinding
}

export interface IPathQueryResult {
    pathType: ISparqlQueryResultBinding,
    pathValue: ISparqlQueryResultBinding
}

export class ShaclShapeParser {
    public readonly options: IShapeParsingOptions;

    public constructor(options: IShapeParsingOptions = {}) {
        this.options = Object.assign({}, {}, options);
    }

    public async parseShapesAsync(shapeGraph: RdfStore): Promise<ShaclShape[]> {
        let shapes = [];

        // Extract all shapes from dataset, and put them in map for 
        // easier manipulation later on
        let shapesQuery = this.buildShapesQuery();
        let shapesQueryResult = await shapeGraph.queryAsync<IShapeQueryResult>(shapesQuery);
        let shapeMap = this.createShapeMap(shapesQueryResult);

        // For each shape, parse it's properties like targets, constraints and path
        for (let shape of shapeMap.values()) {
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
        let constraints = CommonConstraintComponentManager.getAllConstraintParameters();
        let shapeExpectingListTakingParameters = constraints.filter(p => p.shapeExpecting && p.listTaking);
        let shapeExpectingNonListTakingParameters = constraints.filter(p => p.shapeExpecting && !p.listTaking);

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
                    filter(?predicate = ${shapeExpectingNonListTakingParameters.map(p => p.iri).join(' || ?predicate = ')})
                }

                UNION 
                {
                    ?subject ?predicate ?list .
					?list ${RdfRestIRI}*/${RdfFirstIRI} ?shape .
                    filter(?predicate = ${shapeExpectingListTakingParameters.map(p => p.iri).join(' || ?predicate = ')})
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

    private createShapeMap(shapesQueryResult: ISparqlQueryResult<IShapeQueryResult>): Map<string, ShaclShape> {
        let shapeMap = new Map<string, ShaclShape>();

        for (let result of shapesQueryResult.results.bindings) {
            let shape = shapeMap.get(result.shape.value);

            if (!shape) {
                shape = result.path ? new ShaclPropertyShape(new IRI(result.shape.value)) : new ShaclNodeShape(new IRI(result.shape.value));
                shapeMap.set(result.shape.value, shape);
            }

            if (result.deactivated) {
                shape.deactivated = result.deactivated.value === 'true';
            }

            if (result.severity) {
                shape.severity = new IRI(result.severity.value);
            }

            if (result.message) {
                shape.messages.push(RdfFactory.createLiteral(result.message.value, result.message['xml:lang'], result.message.datatype));
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
        let targetsQuery = this.buildTargetsQuery(shape.iri);
        let targetsQueryResult = await shapeGraph.queryAsync<ITargetQueryResult>(targetsQuery);

        for (let result of targetsQueryResult.results.bindings) {
            if (result.targetNode) {
                let targetNode = result.targetNode.type === 'uri' ? new IRI(result.targetNode)
                    : RdfFactory.createLiteral(result.targetNode.value, result.targetNode['xml:lang'], result.targetNode.datatype);

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
        let constraints = CommonConstraintComponentManager.getAllConstraintParameters();

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

    private async parseShapeConstraintsAsync(shape: ShaclShape, shapeMap: Map<string, ShaclShape>, shapeGraph: RdfStore): Promise<any> {
        // Parse  constraints declared by shape
        let constraintsQuery = this.buildConstraintsQuery(shape.iri);
        let constraintsQueryResult = await shapeGraph.queryAsync<IConstraintQueryResult>(constraintsQuery);

        for (let result of constraintsQueryResult.results.bindings) {
            let constraintIRI = new IRI(result.constraint.value);
            let constraintParameter = CommonConstraintComponentManager.getConstraintParameterByIRI(constraintIRI);

            let constraintValue: any;

            if (constraintParameter.listTaking) {
                constraintValue = [];

                let listQuery = this.buildListQuery(new IRI(result.constraintValue.value));
                let listQueryResults = await shapeGraph.queryAsync<IListQueryResult>(listQuery);

                for (let element of listQueryResults.results.bindings) {
                    if (constraintParameter.shapeExpecting) {
                        let childShape = shapeMap.get(element.item.value);
                        childShape.isChildShape = true;

                        this.resolveChildShapeTargets(shape, childShape);
                        constraintValue.push(childShape);
                    } else {
                        constraintValue.push(this.createRdfTermFromSparqlBinding(element.item));
                    }
                }
            } else {
                if (constraintParameter.shapeExpecting) {
                    let childShape = shapeMap.get(result.constraintValue.value);
                    childShape.isChildShape = true;

                    this.resolveChildShapeTargets(shape, childShape);
                    constraintValue = childShape;
                } else {
                    constraintValue = this.createRdfTermFromSparqlBinding(result.constraintValue);
                }
            }

            shape.constraints.push({
                iri: constraintIRI,
                value: constraintValue
            });
        }
    }

    private resolveChildShapeTargets(shape: ShaclShape, childShape: ShaclShape): void {
        if (childShape.targetClasses.length === 0 && childShape.targetNodes.length === 0 &&
            childShape.targetObjectsOf.length === 0 && childShape.targetSubjectsOf.length === 0) {
            childShape.targetClasses = shape.targetClasses;
            childShape.targetNodes = shape.targetNodes;
            childShape.targetObjectsOf = shape.targetObjectsOf;
            childShape.targetSubjectsOf = shape.targetSubjectsOf;
        }
    }

    private createRdfTermFromSparqlBinding(binding: ISparqlQueryResultBinding): RdfTerm {
        switch (binding.type) {
            case 'uri': return new IRI(binding.value);
            case 'bnode': return new BlankNode(binding.value);
            default: return RdfFactory.createLiteral(binding.value, binding['xml:lang'], binding.datatype);
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

    private async parseShapePathAsync(shape: ShaclPropertyShape, shapeGraph: RdfStore): Promise<any> {
        let pathQuery = this.buildPathQuery(shape.iri);
        let pathQueryResult = await shapeGraph.queryAsync<IPathQueryResult>(pathQuery);

        let pathType = pathQueryResult.results.bindings[0].pathType.value;
        let pathValue = pathQueryResult.results.bindings[0].pathValue.value;

        shape.path.pathValue = new IRI(pathValue);
        shape.path.pathType = pathType;

        if (pathType === 'Sequence' || pathType === 'Alternative') {

            let sequencePathQuery = this.buildSequencePathQuery(new IRI(pathValue));
            let sequencePathQueryResult = await shapeGraph.queryAsync<IPathQueryResult>(sequencePathQuery);

            let stringBuilder = [];

            for (let result of sequencePathQueryResult.results.bindings) {
                stringBuilder.push(this.resolveSparqlPathString(shape, pathType));
            }

            shape.path.sparqlPathString = stringBuilder.join(pathType === 'Sequence' ? '/' : '|');

        } else {
            shape.path.sparqlPathString = this.resolveSparqlPathString(shape, pathType);
        }
    }

    private resolveSparqlPathString(shape: ShaclPropertyShape, pathType: string): string {
        switch (pathType) {
            case 'Predicate': return `${shape.path.pathValue}`;
            case 'Inverse': return `^${shape.path.pathValue}`;
            case 'ZeroOrMore': return `${shape.path.pathValue}*`;
            case 'OneOrMore': return `${shape.path.pathValue}+`;
            case 'ZeroOrOne': return `${shape.path.pathValue}?`;
            default: return null;
        }
    }
}