import { IRI } from 'rdflib-ts';
import { ShaclNodeShape } from '../../../src/model/shacl-node-shape';
import 'mocha';
import * as chai from 'chai';

let should = chai.should();

import { ShaclValidationReport } from '../../../src/model/shacl-validation-report';

describe('ShaclValidationReport', () => {
	context('constructor', () => {
		it('should default properties', () => {
			let report = new ShaclValidationReport();

			report.conforms.should.be.true;
			report.shapeGraphWellFormed.should.be.true;
			report.results.should.be.empty;
		});
	});

	context('toNQuads', () => {
		it('should create rdf report based on shacl standard', () => {
			let report = new ShaclValidationReport();
			let nodeShape = new ShaclNodeShape(new IRI('http://example.org#someNodeShape'));
			report.results.push(nodeShape.createValidationResult(new IRI('http://example.org#Bob'), new IRI('http://example.org#Robot'), new IRI('http://example.org#PersonShape')));

			let quads = report.toNQuads();
			quads.should.have.lengthOf(10);
		});
	});
});