import * as uuid from 'uuid/v4';
import * as kill from 'tree-kill';

import { IRI, RdfTerm } from 'rdflib-ts';
import { ShaclValidator } from '../../src/processor/shacl-validator';
import { RdfDataImporter } from 'rdflib-ts';
import { ShaclShapeParser } from '../../src/processor/shacl-shape-parser';
import {
	ShaclValidationResult,
	ShaclValidationReport
} from '../../src/model/shacl-validation-report';
import { DBMSAdapterManagerInstance } from '../../src/utils/dbms/adapters/dbms-adapter-manager';

export class TestHelper {
	public static async delay(ms: number): Promise<void> {
		return new Promise<void>(resolve => setTimeout(resolve, ms));
	}

	public static killProcess(pid: number): void {
		kill(pid);
	}

	public static async runShaclValidator(
		shapeDocumentPath: string,
		dataDocumentPath: string
	): Promise<ShaclValidationReport> {
		const adapter = DBMSAdapterManagerInstance.createAdapter(
			'Apache Jena Fuseki',
			'2.5.0',
			`http://localhost:3030`
		);

		const importer = new RdfDataImporter({ blankNodePrefix: 'sg', skolemize: true });
		const shapeProcessor = new ShaclShapeParser();

		const shapeStore = await adapter.createRdfStoreAsync(`shapes_${uuid()}`);
		await importer.importRdfDataAsync(shapeDocumentPath, shapeStore);

		// Parse shapes from rdf store
		const shapes = await shapeProcessor.parseShapesAsync(shapeStore);

		const dataStore = await adapter.createRdfStoreAsync(`data_${uuid()}`);
		importer.options.blankNodePrefix = 'dg';
		await importer.importRdfDataAsync(dataDocumentPath, dataStore);

		const validator = new ShaclValidator();

		return await validator.validateAsync(shapes, dataStore);
	}

	public static hasValidationResult(
		report: ShaclValidationReport | ShaclValidationResult[],
		constraintComponent: string,
		severity: string,
		focusNode: string,
		resultPath?: string,
		value?: string
	): boolean {
		const results = Array.isArray(report) ? report : report.results;
		return results.some(r =>
			this.checkValidationResult(
				r,
				constraintComponent,
				severity,
				focusNode,
				resultPath,
				value
			)
		);
	}

	public static checkValidationResult(
		result: ShaclValidationResult,
		constraintComponent: string,
		severity: string,
		focusNode: string,
		resultPath?: string,
		value?: string
	): boolean {
		return (
			this.checkTermValue(result.sourceConstraintComponent, constraintComponent) &&
			this.checkTermValue(result.resultSeverity, severity) &&
			this.checkTermValue(result.focusNode, focusNode) &&
			this.checkTermValue(result.resultPath, resultPath) &&
			this.checkTermValue(result.value, value)
		);
	}

	public static checkTermValue(term: RdfTerm, value: string): boolean {
		if (!value) {
			return true;
		} else if (term instanceof IRI) {
			return `${term.namespace.prefix}:${term.relativeValue}` === value;
		} else {
			return term.value === value;
		}
	}
}
