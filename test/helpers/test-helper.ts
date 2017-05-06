import * as del from 'del';
import * as http from 'superagent';
import * as uuid from 'uuid/v4';
import * as path from 'path';
import * as kill from 'tree-kill';
import * as child_process from 'child_process';

import { Server } from 'net';
import { IRI, RdfTerm } from 'rdflib-ts';
import { ShaclValidator } from '../../src/processor/shacl-validator';
import { RdfDataImporter } from 'rdflib-ts';
import { ShaclShapeParser } from '../../src/processor/shacl-shape-parser';
import { IShaclValidationResult, ShaclValidationReport } from '../../src/model/shacl-validation-report';
import { DBMSAdapterManagerInstance } from '../../src/utils/dbms/adapters/dbms-adapter-manager';

export class TestHelper {
	public static async spawnFusekiServerAsync(): Promise<number> {
		let fusekiDir = path.resolve(process.cwd(), './test/3rdParty/apache-jena-fuseki-2.5.0');
		let fusekiBase = path.join(fusekiDir, 'run');
		let fusekiScript = path.join(fusekiDir, /^win/.test(process.platform) ? 'fuseki-server.bat' : 'fuseki-server.sh');

		process.env.FUSEKI_HOME = fusekiDir;
		process.env.FUSEKI_BASE = fusekiBase;

		await del(fusekiBase);
		let pid = child_process.spawn(require.resolve(fusekiScript), [],
			{
				env: process.env,
				detached: true,
				cwd: fusekiDir,
				stdio: 'ignore'
			}).pid;

		// Give server time to get up and running
		await TestHelper.delay(4000);
		return pid;
	}

	public static async delay(ms: number): Promise<void> {
		return new Promise<void>(resolve => setTimeout(resolve, ms));
	}

	public static killProcess(pid: number): void {
		kill(pid);
	}

	public static async runShaclValidator(shapeDocumentPath: string, dataDocumentPath: string): Promise<ShaclValidationReport> {
		let adapter = DBMSAdapterManagerInstance.createAdapter('Apache Jena Fuseki', '2.5.0', `http://${process.env.LOCALHOST}:3030`);

		let importer = new RdfDataImporter({ blankNodePrefix: 'sg', skolemize: true });
		let shapeProcessor = new ShaclShapeParser();

		let shapeStore = await adapter.createRdfStoreAsync(`shapes_${uuid()}`);
		await importer.importRdfDataAsync(shapeDocumentPath, shapeStore);

		// Parse shapes from rdf store
		let shapes = await shapeProcessor.parseShapesAsync(shapeStore);

		let dataStore = await adapter.createRdfStoreAsync(`data_${uuid()}`);
		importer.options.blankNodePrefix = 'dg';
		await importer.importRdfDataAsync(dataDocumentPath, dataStore);

		let validator = new ShaclValidator();

		return await validator.validateAsync(shapes, dataStore);
	}

	public static hasValidationResult(report: ShaclValidationReport | IShaclValidationResult[], constraintComponent: string, severity: string, focusNode: string, resultPath?: string, value?: string): boolean {
		let results = Array.isArray(report) ? report : report.results;
		return results.some(r => this.checkValidationResult(r, constraintComponent, severity, focusNode, resultPath, value));
	}

	public static checkValidationResult(result: IShaclValidationResult, constraintComponent: string, severity: string, focusNode: string, resultPath?: string, value?: string): boolean {
		return this.checkTermValue(result.sourceConstraintComponent, constraintComponent) && this.checkTermValue(result.resultSeverity, severity) 
					&& this.checkTermValue(result.focusNode, focusNode) && this.checkTermValue(result.resultPath, resultPath) && this.checkTermValue(result.value, value);
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