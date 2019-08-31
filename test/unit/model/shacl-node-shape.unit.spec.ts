import { IRI } from 'rdflib-ts';
import { ShaclNodeShape } from '../../../src/model/shacl-node-shape';
import { ViolationSeverityIRI } from '../../../src/model/constants';

describe('ShaclNodeShape - Unit', () => {
	context('constructor', () => {
		it('should set iri property and default other properties', () => {
			const nodeShape = new ShaclNodeShape(new IRI('http://example.org#someNodeShape'));

			nodeShape.iri.value.should.equal('http://example.org#someNodeShape');
			nodeShape.isChildShape.should.be.false;
			nodeShape.targetClasses.should.be.empty;
			nodeShape.targetNodes.should.be.empty;
			nodeShape.targetObjectsOf.should.be.empty;
			nodeShape.targetSubjectsOf.should.be.empty;
			nodeShape.constraints.should.be.empty;
			nodeShape.messages.should.be.empty;
			nodeShape.deactivated.should.be.false;
			nodeShape.severity.value.should.equal(ViolationSeverityIRI.value);
		});
	});
});
