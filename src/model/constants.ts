import { IRI, NamespaceManagerInstance } from 'rdflib-ts';

NamespaceManagerInstance.registerNamespace('sh', 'http://www.w3.org/ns/shacl#');

/* --------------------------------------- RDF ---------------------------------------- */
export const RdfTypeIRI: IRI = new IRI('rdf:type');
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

