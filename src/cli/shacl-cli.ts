#!/usr/bin/env node

import * as fs from 'fs';
import * as cli from 'cli';
import * as clui from 'clui';
import * as uuid from 'uuid/v4';
import * as color from 'cli-color';

import { Stopwatch } from '../utils/performance/stopwatch';
import { ShaclShape } from '../model/shacl-shape';
import { ShaclValidator } from '../processor/shacl-validator';
import { RdfDBMSAdapter } from '../utils/dbms/adapters/rdf-dbms-adapter';
import { ShaclShapeParser } from '../processor/shacl-shape-parser';
import { RdfDataExporter, RdfStore, RdfDataImporter } from 'rdflib-ts';
import { ShaclValidationReport } from '../model/shacl-validation-report';
import { DBMSAdapterManagerInstance } from '../utils/dbms/adapters/dbms-adapter-manager';

export interface ShaclCLIOptions {
	shapeDocumentPath: string;
	dataDocumentPath: string;
	validationReportPath: string;
	dbms: string;
	dbmsVersion: string;
	dbmsUrl: string;
}

export class ShaclCLI {
	private _cliWidth: number;
	public options: ShaclCLIOptions;

	public constructor(options?: ShaclCLIOptions) {
		this._cliWidth = 85;
		this.options =
			options ||
			cli.parse({
				shapeDocumentPath: ['s', 'Path to shape document', 'file'],
				dataDocumentPath: ['d', 'Path to document to be validated', 'file'],
				validationReportPath: ['r', 'Validation report output path', 'file'],
				dbms: [false, 'DBMS to use for validation', 'string', 'Apache Jena Fuseki'],
				dbmsVersion: [false, 'DBMS version', 'string', '2.5.0'],
				dbmsUrl: [false, 'URL DBMS running at', 'string', 'http://localhost:3030']
			});
	}

	public async runAsync(): Promise<void> {
		let shapes: ShaclShape[];
		let dataStore: RdfStore;
		let adapter: RdfDBMSAdapter;

		try {
			// Print header
			const header = ' SHACL CLI 1.0 ';
			const leftHeaderBorder = '='.repeat(Math.floor((this._cliWidth - header.length) / 2));
			const rightHeaderBorder = '='.repeat(Math.ceil((this._cliWidth - header.length) / 2));
			this.printCliMessage(`${leftHeaderBorder}${header}${rightHeaderBorder}`, 246, 2, 0, 1);

			// Print shape and data document size info
			const shapeFileSize = fs.statSync(this.options.shapeDocumentPath).size;
			const dataFileSize = fs.statSync(this.options.dataDocumentPath).size;
			this.printCliMessage(`Shape document size: ${shapeFileSize * 0.001} KB`, 252, 2, 2, 2);
			this.printCliMessage(`Data document size: ${dataFileSize * 0.001} KB`, 252, 2, 2, 1);

			process.stdout.write('\n\n');

			const spinner = new clui.Spinner();
			spinner.message(color.xterm(252)('Parsing input documents...'));
			spinner.start();

			// Get appropriate adapter if target DBMS is supported.
			// For now only rest adapters are supported, support for in-memory version will be added later
			adapter = DBMSAdapterManagerInstance.createAdapter(
				this.options.dbms,
				this.options.dbmsVersion,
				this.options.dbmsUrl
			);

			const stopwatch = new Stopwatch();

			// Import and parse shapes from shape document
			// and import data document to be validated
			[shapes, dataStore] = await Promise.all([
				this.parseShapesAsync(this.options.shapeDocumentPath, adapter),
				this.importDataDocumentAsync(this.options.dataDocumentPath, adapter)
			]);

			spinner.stop();

			this.printCliMessage(`Total SHACL shapes: ${shapes.length}`, 252, 2, 2, 0);
			this.printCliMessage(`Total target triples: ${dataStore.storeSize}`, 252, 2, 2, 1);

			process.stdout.write('\n\n');

			spinner.message(color.xterm(252)('Validating, please wait...'));
			spinner.start();

			// Validate data imported in data store
			const report: ShaclValidationReport = await this.validateDataAsync(
				shapes,
				dataStore,
				adapter
			);

			// Export validation report
			const exporter = new RdfDataExporter({ unskolemize: true });
			await exporter.exportRdfDataAsync(report.toNQuads(), this.options.validationReportPath);

			spinner.stop();

			this.printCliMessage(
				`Shapes graph well formed: ${report.shapeGraphWellFormed ? 'Yes' : 'No'}`,
				report.shapeGraphWellFormed ? 40 : 124,
				2,
				2,
				0
			);
			this.printCliMessage(
				`Data graph conforms to shapes graph: ${report.conforms ? 'Yes' : 'No'}`,
				report.conforms ? 40 : 124,
				2,
				2,
				1
			);

			if (report.results.length > 0) {
				const severityMap = new Map<string, number>();
				for (const result of report.results) {
					const severity = `${result.resultSeverity.namespace.prefix}:${result.resultSeverity.relativeValue}`;
					if (!severityMap.has(severity)) {
						severityMap.set(severity, 0);
					}

					severityMap.set(severity, severityMap.get(severity) + 1);
				}

				this.printCliMessage('Validation results by severity:', 252, 2, 2, 2);
				for (const severity of severityMap.entries()) {
					this.printCliMessage(`  * ${severity[0]} count: ${severity[1]}`, 252, 2, 2, 1);
				}
			}

			this.printCliMessage(`Validation time: ${stopwatch.elapsed()}`, 40, 2, 2, 2);
		} catch (err) {
			this.printCliMessage(`Validation failed: ${err.message}`, 124, 2, 2, 0);

			if (adapter) {
				await adapter.deleteRdfStoreAsync(dataStore);
			}
		} finally {
			this.printCliMessage('='.repeat(this._cliWidth), 242, 2, 0, 1);
		}
	}

	public async parseShapesAsync(
		shapeDocumentPath: string,
		adapter: RdfDBMSAdapter
	): Promise<ShaclShape[]> {
		let shapeStore: RdfStore = null;

		try {
			const importer = new RdfDataImporter({ blankNodePrefix: 'sg', skolemize: true });
			const shapeProcessor = new ShaclShapeParser();

			// Import shape document into new rdf store created on target DBMS
			shapeStore = await adapter.createRdfStoreAsync(`shapes_${uuid()}`);
			await importer.importRdfDataAsync(shapeDocumentPath, shapeStore);

			// Parse shapes from rdf store
			return await shapeProcessor.parseShapesAsync(shapeStore);
		} finally {
			// remove created store from DBMS when parsing is over
			await adapter.deleteRdfStoreAsync(shapeStore);
		}
	}

	public async importDataDocumentAsync(
		dataDocumentPath: string,
		adapter: RdfDBMSAdapter
	): Promise<RdfStore> {
		let dataStore: RdfStore = null;

		try {
			const importer = new RdfDataImporter({ blankNodePrefix: 'dg', skolemize: true });

			// Import data document into new rdf store created on target DBMS
			dataStore = await adapter.createRdfStoreAsync(`data_${uuid()}`);
			await importer.importRdfDataAsync(dataDocumentPath, dataStore);

			return dataStore;
		} finally {
			// If something goes wrong, remove created store from DBMS
			await adapter.deleteRdfStoreAsync(dataStore);
		}
	}

	public async validateDataAsync(
		shapes: ShaclShape[],
		dataStore: RdfStore,
		adapter: RdfDBMSAdapter
	): Promise<ShaclValidationReport> {
		try {
			const stopwatch = new Stopwatch();
			const validator = new ShaclValidator();

			// Validate quads in data store against set of SHACL shapes
			stopwatch.start();
			return await validator.validateAsync(shapes, dataStore);
		} finally {
			// Remove created store from DBMS after validation is over
			await adapter.deleteRdfStoreAsync(dataStore);
		}
	}

	private insertSubstring(str: string, index: number, substr: string) {
		if (index > 0) {
			return `${str.substr(0, index)}${substr}${str.substr(index, str.length)}`;
		} else {
			return `${substr}${str}`;
		}
	}

	private printCliMessage(
		message: string,
		colorCode: number,
		ident = 0,
		margin = 0,
		newLines = 0
	) {
		const maxLength = this._cliWidth - margin * 2;
		const lines = Math.ceil(message.length / maxLength);

		const rowIdent = '\n'.repeat(newLines);
		const columnIdent = ' '.repeat(ident + margin);

		process.stdout.write(rowIdent);

		for (let i = 0; i < lines - 1; i++) {
			const lineDivideIndex = maxLength * (i + 1) + i * (ident + margin);
			const lastWhitespaceIndex = message.slice(0, lineDivideIndex).lastIndexOf(' ');
			message = this.insertSubstring(message, lastWhitespaceIndex + 1, `\n${columnIdent}`);
		}

		process.stdout.write(color.xterm(colorCode)(`\r${columnIdent}${message}`));
	}
}

// Entry point
(async () => {
	const shaclCLI = new ShaclCLI();
	await shaclCLI.runAsync();

	process.exit();
})();
