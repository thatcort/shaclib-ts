#!/usr/bin/env node

import * as fs from 'fs';
import * as cli from 'cli';
import * as clui from 'clui';
import * as path from 'path';
import * as uuid from 'uuid/v4';
import * as color from 'cli-color';

import { Stopwatch } from '../utils/performance/stopwatch';
import { ShaclShape } from '../model/shacl-shape';
import { ShaclValidator } from '../processor/shacl-validator';
import { RdfDBMSAdapter } from '../utils/dbms/adapters/rdf-dbms-adapter';
import { ShaclShapeParser } from '../processor/shacl-shape-parser';
import { ShaclValidationReport } from '../model/shacl-validation-report';
import { RdfDataExporter, RdfStore, RdfDataImporter } from 'rdflib-ts';
import { DBMSAdapterManagerInstance } from '../utils/dbms/adapters/dbms-adapter-manager';


export interface IShaclCLIOptions {
	shapeDocumentPath: string,
	dataDocumentPath: string,
	validationReportPath: string,
	dbms: string,
	dbmsVersion: string,
	dbmsUrl: string
}

export class ShaclCLI {
	public options: IShaclCLIOptions;

	public constructor(options?: IShaclCLIOptions) {
		this.options = options || cli.parse({
			shapeDocumentPath: ['s', 'Path to shape document', 'file'],
			dataDocumentPath: ['d', 'Path to document to be validated', 'file'],
			validationReportPath: ['r', 'Validation report output path', 'file'],
			dbms: [false, 'DBMS to use for validation', 'string', 'Apache Jena Fuseki'],
			dbmsVersion: [false, 'DBMS version', 'string', '2.5.0'],
			dbmsUrl: [false, 'URL DBMS running at', 'string', 'http://localhost:3030'],
		});
	}

	public async runAsync(): Promise<void> {

		let shapes: ShaclShape[];
		let dataStore: RdfStore;
		let adapter: RdfDBMSAdapter;

		let headerLength;

		try {
			let spinner = new clui.Spinner();
			let stopwatch = new Stopwatch();

			let shapeFileSize = fs.statSync(this.options.shapeDocumentPath).size;
			let dataFileSize = fs.statSync(this.options.dataDocumentPath).size;

			let shapeDocumentSizeInfo = color.xterm(252)(`Shape document size: ${shapeFileSize * 0.001} KB`);
			let dataDocumentSizeInfo = color.xterm(252)(`Data document size: ${dataFileSize * 0.001} KB`);

			headerLength = shapeDocumentSizeInfo.length > dataDocumentSizeInfo.length ? shapeDocumentSizeInfo.length : dataDocumentSizeInfo.length;
			let header = color.blackBright(`\r\n  ${'='.repeat(headerLength - 13)} SHACL CLI 1.0 ${'='.repeat(headerLength - 14)}`);

			process.stdout.write(header);
			process.stdout.write(`\r\n\n    ${shapeDocumentSizeInfo}`);
			process.stdout.write(`\r\n    ${dataDocumentSizeInfo}\n\n`);

			spinner.message(color.xterm(252)('Parsing input documents...'));
			spinner.start();

			// Get appropriate adapter if target DBMS is supported.
			// For now only rest adapters are supported, support for in-memory version will be added later
			adapter = DBMSAdapterManagerInstance.createAdapter(this.options.dbms, this.options.dbmsVersion, this.options.dbmsUrl);

			// Import and parse shapes from shape document
			// and import data document to be validated
			[shapes, dataStore] = await Promise.all([
				this.parseShapesAsync(this.options.shapeDocumentPath, adapter),
				this.importDataDocumentAsync(this.options.dataDocumentPath, adapter)
			]);

			let shapeCountInfo = color.xterm(252)(`Total SHACL shapes: ${shapes.length}`);
			let tripleCountInfo = color.xterm(252)(`Total target triples: ${dataStore.storeSize}`);

			spinner.stop();

			process.stdout.write(`\r    ${shapeCountInfo}`);
			process.stdout.write(`\r\n    ${tripleCountInfo}\n\n`);

			spinner.message(color.xterm(252)('Validating, please wait...'));
			spinner.start();

			// Validate data imported in data store
			let report: ShaclValidationReport = await this.validateDataAsync(shapes, dataStore, adapter);

			// Export validation report		
			await this.exportReportAsync(report, this.options.validationReportPath);

			spinner.stop();
			let resultMessageBuilder = [];

			if (report.conforms) {
				resultMessageBuilder.push(color.green('    Validation result: Data graph conforms to shape graph'));
			} else {
				resultMessageBuilder.push(color.red('    Validation result: Data graph does not conform to shape graph'));
			}

			let severityMap = new Map<string, number>();
			for (let result of report.results) {
				let severity = `${result.resultSeverity.namespace.prefix}:${result.resultSeverity.relativeValue}`;
				if (!severityMap.has(severity)) {
					severityMap.set(severity, 0);
				}

				severityMap.set(severity, severityMap.get(severity) + 1);
			}

			for (let severity of severityMap.entries()) {
				resultMessageBuilder.push(`    ${severity[0]} count: ${severity[1]}`);
			}

			process.stdout.write(report.conforms ? color.yellow(`${resultMessageBuilder.join('\n')}`) : color.red(`${resultMessageBuilder.join('    \n')}`));
			process.stdout.write(color.xterm(252)(`\n\n    Validation time: ${stopwatch.elapsed()}`));

		} catch (err) {
			this.printCliMessage(color.red(`Validation failed: ${err.message}`), 4, headerLength * 2 - 10);

			if (adapter) {
				await adapter.deleteRdfStoreAsync(dataStore);
			}

			throw err;
		} finally {
			let footer = color.blackBright(`\r\n  ${'='.repeat(headerLength * 2 - 12)}\n`);
			process.stdout.write(footer);
		}
	}

	public parseShapesAsync(shapeDocumentPath: string, adapter: RdfDBMSAdapter): Promise<ShaclShape[]> {
		return new Promise<ShaclShape[]>(async (resolve, reject) => {
			let shapeStore: RdfStore = null;

			try {
				let stopwatch = new Stopwatch();
				let importer = new RdfDataImporter();
				let shapeProcessor = new ShaclShapeParser();

				// Import shape document into new rdf store created on target DBMS
				stopwatch.start();
				shapeStore = await adapter.createRdfStoreAsync(`shapes_${uuid()}`);
				await importer.importRdfDataAsync(shapeDocumentPath, shapeStore);

				// Parse shapes from rdf store
				stopwatch.start();
				let shapes = await shapeProcessor.parseShapesAsync(shapeStore);

				resolve(shapes);
			} catch (err) {
				reject(err);
			} finally {
				// remove created store from DBMS when parsing is over
				await adapter.deleteRdfStoreAsync(shapeStore);
			}
		});
	}

	public importDataDocumentAsync(dataDocumentPath: string, adapter: RdfDBMSAdapter): Promise<RdfStore> {
		return new Promise<RdfStore>(async (resolve, reject) => {
			let dataStore: RdfStore = null;

			try {
				let stopwatch = new Stopwatch();
				let importer = new RdfDataImporter();

				// Import data document into new rdf store created on target DBMS
				stopwatch.start();
				dataStore = await adapter.createRdfStoreAsync(`data_${uuid()}`);
				await importer.importRdfDataAsync(dataDocumentPath, dataStore);

				resolve(dataStore);
			} catch (err) {
				// If something goes wrong, remove created store from DBMS
				await adapter.deleteRdfStoreAsync(dataStore);
				reject(err);
			}
		});
	}

	public validateDataAsync(shapes: ShaclShape[], dataStore: RdfStore, adapter: RdfDBMSAdapter): Promise<ShaclValidationReport> {
		return new Promise<ShaclValidationReport>(async (resolve, reject) => {
			try {
				let stopwatch = new Stopwatch();
				let validator = new ShaclValidator();

				// Validate quads in data store against set of SHACL shapes
				stopwatch.start();
				let report = await validator.validateAsync(shapes, dataStore);

				resolve(report);
			} catch (err) {
				reject(err);
			} finally {
				// Remove created store from DBMS after validation is over
				await adapter.deleteRdfStoreAsync(dataStore);
			}
		});
	}

	public exportReportAsync(report: ShaclValidationReport, filePath: string): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			try {
				let stopwatch = new Stopwatch();
				let exporter = new RdfDataExporter();

				// Export report to file with appropriate extension
				stopwatch.start();
				await exporter.exportRdfDataAsync(report.toNQuads(), this.options.validationReportPath);

				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	private insertSubstring(str: string, index: number, substr: string) {
		if (index > 0) {
			return `${str.substr(0, index)}${substr}${str.substr(index, str.length)}`;
		} else {
			return `${substr}${str}`;
		}
	}

	private printCliMessage(message: string, ident: number, maxLength: number) {
		let lines = message.length / maxLength;

		for (let i = 0; i < lines; i++) {
			message = this.insertSubstring(message, (maxLength * (i + 1) + i * ident), `\n${' '.repeat(ident)}`);
		}

		process.stdout.write(`\r${' '.repeat(ident)}${message}`);
	}
}

// Entry point
(async () => {
	try {
		let shaclCLI = new ShaclCLI();
		await shaclCLI.runAsync();
	} catch (err) {

	} finally {
		process.exit();
	}

})();
