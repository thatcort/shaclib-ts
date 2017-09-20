import { IRI, NamespaceManagerInstance } from 'rdflib-ts';

NamespaceManagerInstance.registerNamespace('sh', 'http://www.w3.org/ns/shacl#');

/* --------------------------------------- RDF ---------------------------------------- */
export const RdfTypeIRI: IRI = new IRI('rdf:type');
export const RdfRestIRI: IRI = new IRI('rdf:rest');
export const RdfFirstIRI: IRI = new IRI('rdf:first');
/* ------------------------------------------------------------------------------------ */

/* --------------------------------------- RDFS --------------------------------------- */
export const RdfsClassIRI: IRI = new IRI('rdf:Class');
export const RdfsSubClassOfIRI: IRI = new IRI('rdfs:subClassOf');
/* ------------------------------------------------------------------------------------ */

/* ------------------------------- SHACL Shape Severity ------------------------------- */
export const InfoSeverityIRI: IRI = new IRI('sh:Info');
export const WarningSeverityIRI: IRI = new IRI('sh:Warning');
export const ViolationSeverityIRI: IRI = new IRI('sh:Violation');
/* ------------------------------------------------------------------------------------ */

/* --------------------------------- SHACL Validation --------------------------------- */
export const ValueIRI: IRI = new IRI('sh:value');
export const DetailIRI: IRI = new IRI('sh:detail');
export const ResultIRI: IRI = new IRI('sh:result');
export const ConformsIRI: IRI = new IRI('sh:conforms');
export const FocusNodeIRI: IRI = new IRI('sh:focusNode');
export const ResultPathIRI: IRI = new IRI('sh:resultPath');
export const SourceShapeIRI: IRI = new IRI('sh:sourceShape');
export const ResultMessageIRI: IRI = new IRI('sh:resultMessage');
export const ResultSeverityIRI: IRI = new IRI('sh:resultSeverity');
export const ValidationReportIRI: IRI = new IRI('sh:ValidationReport');
export const ValidationResultIRI: IRI = new IRI('sh:ValidationResult');
export const ShapesGraphWellFormedIRI: IRI = new IRI('sh:shapesGraphWellFormed');
export const SourceConstraintComponentIRI: IRI = new IRI('sh:sourceConstraintComponent');
/* ------------------------------------------------------------------------------------ */

/* ----------------------------------- SHACL Shapes ----------------------------------- */
export const NodeShapeIRI: IRI = new IRI('sh:nodeShape');
export const TargetNodeIRI: IRI = new IRI('sh:targetNode');
export const InversePathIRI: IRI = new IRI('sh:inversePath');
export const TargetClassIRI: IRI = new IRI('sh:targetClass');
export const ShapeMessageIRI: IRI = new IRI('sh:message');
export const PropertyPathIRI: IRI = new IRI('sh:path');
export const ZeroOrOnePathIRI: IRI = new IRI('sh:zeroOrOnePath');
export const OneOrMorePathIRI: IRI = new IRI('sh:oneOrMorePath');
export const PropertyShapeIRI: IRI = new IRI('sh:propertyShape');
export const ShapeSeverityIRI: IRI = new IRI('sh:severity');
export const ZeroOrMorePathIRI: IRI = new IRI('sh:zeroOrMorePath');
export const AlternativePathIRI: IRI = new IRI('sh:alternativePath');
export const TargetObjectsOfIRI: IRI = new IRI('sh:targetObjectsOf');
export const TargetSubjectsOfIRI: IRI = new IRI('sh:targetSubjectsOf');
export const ShapeDeactivatedIRI: IRI = new IRI('sh:deactivated');
/* ---------------------------------------------------------------------------------------- */

/* -------------------------- SHACL - Constraint Components ------------------------------- */
export const PropertyShapeComponentIRI: IRI = new IRI('sh:PropertyShapeComponent');
export const PropertyParameterIRI: IRI = new IRI('sh:property');

export const MaxCountComponentIRI: IRI = new IRI('sh:MaxCountConstraintComponent');
export const MaxCountParameterIRI: IRI = new IRI('sh:maxCount');

export const MinCountComponentIRI: IRI = new IRI('sh:MinCountConstraintComponent');
export const MinCountParameterIRI: IRI = new IRI('sh:minCount');

export const ClassComponentIRI: IRI = new IRI('sh:ClassConstraintComponent');
export const ClassParameterIRI: IRI = new IRI('sh:class');

export const DatatypeComponentIRI: IRI = new IRI('sh:DatatypeConstraintComponent');
export const DatatypeParameterIRI: IRI = new IRI('sh:datatype');

export const NodeKindComponentIRI: IRI = new IRI('sh:NodeKindConstraintComponent');
export const NodeKindParameterIRI: IRI = new IRI('sh:nodeKind');
export const NodeKindBlankNodeValueIRI: IRI = new IRI('sh:BlankNode');
export const NodeKindIRIValueIRI: IRI = new IRI('sh:IRI');
export const NodeKindLiteralValueIRI: IRI = new IRI('sh:Literal');
export const NodeKindBlankNodeOrIRIValueIRI: IRI = new IRI('sh:BlankNodeOrIRI');
export const NodeKindBlankNodeOrLiteralValueIRI: IRI = new IRI('sh:BlankNodeOrLiteral');
export const NodeKindIRIOrLiteralValueIRI: IRI = new IRI('sh:IRIOrLiteral');


export const PatternComponentIRI: IRI = new IRI('sh:PatternConstraintComponent');
export const PatternParameterIRI: IRI = new IRI('sh:pattern');
export const FlagsParameterIRI: IRI = new IRI('sh:flags');

export const ClosedComponentIRI: IRI = new IRI('sh:ClosedConstraintComponent');
export const ClosedParameterIRI: IRI = new IRI('sh:closed');
export const IgnoredPropertiesParameterIRI: IRI = new IRI('sh:ignoredProperties');

export const AndComponentIRI: IRI = new IRI('sh:AndConstraintComponent');
export const AndParameterIRI: IRI = new IRI('sh:and');

export const NotComponentIRI: IRI = new IRI('sh:NotConstraintComponent');
export const NotParameterIRI: IRI = new IRI('sh:not');

export const OrComponentIRI: IRI = new IRI('sh:OrConstraintComponent');
export const OrParameterIRI: IRI = new IRI('sh:or');

export const XoneComponentIRI: IRI = new IRI('sh:XoneConstraintComponent');
export const XoneParameterIRI: IRI = new IRI('sh:xone');

export const MaxExclusiveComponentIRI: IRI = new IRI('sh:MaxExclusiveConstraintComponent');
export const MaxExclusiveParameterIRI: IRI = new IRI('sh:maxExclusive');

export const MinExclusiveComponentIRI: IRI = new IRI('sh:MinExclusiveConstraintComponent');
export const MinExclusiveParameterIRI: IRI = new IRI('sh:minExclusive');

export const MaxInclusiveComponentIRI: IRI = new IRI('sh:MaxInclusiveConstraintComponent');
export const MaxInclusiveParameterIRI: IRI = new IRI('sh:maxInclusive');

export const MinInclusiveComponentIRI: IRI = new IRI('sh:MinInclusiveConstraintComponent');
export const MinInclusiveParameterIRI: IRI = new IRI('sh:minInclusive');

export const MinLengthComponentIRI: IRI = new IRI('sh:MinLengthConstraintComponent');
export const MinLengthParameterIRI: IRI = new IRI('sh:minLength');

export const MaxLengthComponentIRI: IRI = new IRI('sh:MaxLengthConstraintComponent');
export const MaxLengthParameterIRI: IRI = new IRI('sh:maxLength');

export const LanguageInComponentIRI: IRI = new IRI('sh:LanguageInConstraintComponent');
export const LanguageInParameterIRI: IRI = new IRI('sh:languageIn');

export const UniqueLangComponentIRI: IRI = new IRI('sh:UniqueLangConstraintComponent');
export const UniqueLangParameterIRI: IRI = new IRI('sh:uniqueLang');

export const HasValueComponentIRI: IRI = new IRI('sh:HasValueConstraintComponent');
export const HasValueParameterIRI: IRI = new IRI('sh:hasValue');

export const InComponentIRI: IRI = new IRI('sh:InConstraintComponent');
export const InParameterIRI: IRI = new IRI('sh:in');

export const NodeComponentIRI: IRI = new IRI('sh:NodeConstraintComponent');
export const NodeParameterIRI: IRI = new IRI('sh:node');

export const QualifiedValueShapeComponentIRI: IRI = new IRI('sh:QualifiedValueShapeConstraintComponent');
export const QualifiedValueShapeParameterIRI: IRI = new IRI('sh:qualifiedValueShape');
export const QualifiedValueShapesDisjointParameterIRI: IRI = new IRI('sh:qualifiedValueShapesDisjoint');
export const QualifiedMinCountParameterIRI: IRI = new IRI('sh:qualifiedMinCount');
export const QualifiedMaxCountParameterIRI: IRI = new IRI('sh:qualifiedMaxCount');

export const EqualsComponentIRI: IRI = new IRI('sh:EqualsConstraintComponent');
export const EqualsParameterIRI: IRI = new IRI('sh:equals');

export const DisjointComponentIRI: IRI = new IRI('sh:DisjointConstraintComponent');
export const DisjointParameterIRI: IRI = new IRI('sh:disjoint');

export const LessThanComponentIRI: IRI = new IRI('sh:LessThanConstraintComponent');
export const LessThanParameterIRI: IRI = new IRI('sh:lessThan');

export const LessThanOrEqualsComponentIRI: IRI = new IRI('sh:LessThanOrEqualsConstraintComponent');
export const LessThanOrEqualsParameterIRI: IRI = new IRI('sh:lessThanOrEquals');

export const SparqlComponentIRI: IRI = new IRI('sh:SPARQLConstraintComponent');
export const SparqlParameterIRI: IRI = new IRI('sh:sparql');

export const SelectComponentIRI: IRI = new IRI('sh:SelectConstraintComponent');
export const AskComponentIRI: IRI = new IRI('sh:AskConstraintComponent');
export const PrefixesParameterIRI: IRI = new IRI('sh:prefixes');
export const SelectParameterIRI: IRI = new IRI('sh:select');
export const AskParameterIRI: IRI = new IRI('sh:ask');
/* ---------------------------------------------------------------------------------------- */