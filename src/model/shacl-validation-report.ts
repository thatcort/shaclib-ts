import { ValidationReportIRI, ValidationResultIRI, ValueIRI } from './constants';
import { ResultSeverityIRI, ShapesGraphWellFormedIRI, SourceConstraintComponentIRI, SourceShapeIRI } from './constants';
import { ConformsIRI, DetailIRI, FocusNodeIRI, RdfTypeIRI, ResultIRI, ResultMessageIRI, ResultPathIRI } from './constants';
import { BlankNode, IRI, Literal, NonBlankNode, NQuad, RdfFactory, RdfTerm, XsdBooleanIRI, TypedLiteral } from 'rdflib-ts';

export interface IShaclValidationResult {
	resultId: IRI | BlankNode;
	focusNode: NonBlankNode;
	sourceConstraintComponent: IRI;
	resultSeverity: IRI;
	resultPath?: IRI;
	value?: RdfTerm;
	details?: IShaclValidationResult[];
	sourceShape?: IRI | BlankNode;
	resultMessages?: Literal[];
}

export class ShaclValidationReport {
	public conforms: boolean;
	public shapeGraphWellFormed: boolean;
	public results: IShaclValidationResult[];

	public constructor() {
		this.conforms = true;
		this.shapeGraphWellFormed = true;
		this.results = [];
	}

	public toNQuads(graph?: IRI): NQuad[] {
		let quads: NQuad[] = [];

		let reportId = new BlankNode();

		quads.push(new NQuad(reportId, RdfTypeIRI, ValidationReportIRI, graph));
		quads.push(new NQuad(reportId, ConformsIRI, new TypedLiteral(this.conforms.toString(), XsdBooleanIRI), graph));
		quads.push(new NQuad(reportId, ShapesGraphWellFormedIRI, new TypedLiteral(this.shapeGraphWellFormed.toString(), XsdBooleanIRI), graph));

		for (let result of this.results) {
			quads.push(new NQuad(reportId, ResultIRI, result.resultId, graph));
			quads = quads.concat(this.resultToNQuads(result));
			quads = quads.concat(this.detailsToNQuads(result, graph));
		}

		return quads;
	}

	public resultToNQuads(result: IShaclValidationResult, graph?: IRI): NQuad[] {
		let quads: NQuad[] = [];

		quads.push(new NQuad(result.resultId, RdfTypeIRI, ValidationResultIRI, graph));
		quads.push(new NQuad(result.resultId, FocusNodeIRI, result.focusNode, graph));
		quads.push(new NQuad(result.resultId, ResultSeverityIRI, result.resultSeverity, graph));
		quads.push(new NQuad(result.resultId, SourceConstraintComponentIRI, result.sourceConstraintComponent, graph));

		if (result.resultPath) {
			quads.push(new NQuad(result.resultId, ResultPathIRI, result.resultPath, graph));
		}

		if (result.value) {
			quads.push(new NQuad(result.resultId, ValueIRI, result.value, graph));
		}

		if (result.sourceShape) {
			quads.push(new NQuad(result.resultId, SourceShapeIRI, result.sourceShape, graph));
		}

		for (let message of result.resultMessages) {
			quads.push(new NQuad(result.resultId, ResultMessageIRI, message, graph));
		}

		return quads;
	}

	public detailsToNQuads(result: IShaclValidationResult, graph?: IRI): NQuad[] {
		let quads: NQuad[] = [];

		for (let detail of result.details) {
			quads.push(new NQuad(result.resultId, DetailIRI, detail.resultId, graph));
			quads = quads.concat(this.resultToNQuads(detail, graph));
			quads = quads.concat(this.detailsToNQuads(detail, graph));
		}

		return quads;
	}
}