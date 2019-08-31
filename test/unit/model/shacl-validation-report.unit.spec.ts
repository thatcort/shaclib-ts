import { IRI } from 'rdflib-ts';
import { ShaclNodeShape } from '../../../src/model/shacl-node-shape';
import { ShaclValidationReport } from '../../../src/model/shacl-validation-report';

describe('ShaclValidationReport', () => {
	context('constructor', () => {
		it('should default properties', () => {
			const report = new ShaclValidationReport();

			report.conforms.should.be.true;
			report.shapeGraphWellFormed.should.be.true;
			report.results.should.be.empty;
		});
	});

	context('toNQuads', () => {
		it('should create rdf report based on shacl standard', () => {
			const report = new ShaclValidationReport();
			const nodeShape = new ShaclNodeShape(new IRI('http://example.org#someNodeShape'));
			report.results.push(
				nodeShape.createValidationResult(
					new IRI('http://example.org#Bob'),
					new IRI('http://example.org#Robot'),
					new IRI('http://example.org#PersonShape')
				)
			);

			const quads = report.toNQuads();
			quads.should.have.lengthOf(10);
		});
	});
});
