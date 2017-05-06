import 'mocha';
import * as chai from 'chai';

let should = chai.should();

import { IRI } from 'rdflib-ts';
import { ShaclPropertyShape } from '../../../src/model/shacl-property-shape';
import { ViolationSeverityIRI } from '../../../src/model/constants';

describe('ShaclNodeShape - Unit', () => {
	context('constructor', () => {
		it('should set iri and path properties and default other properties', () => {
			let propertyShape = new ShaclPropertyShape(new IRI('http://example.org#someNodeShape'), null);

			propertyShape.iri.value.should.equal('http://example.org#someNodeShape');
			propertyShape.isChildShape.should.be.false;
			propertyShape.targetClasses.should.be.empty;
			propertyShape.targetNodes.should.be.empty;
			propertyShape.targetObjectsOf.should.be.empty;
			propertyShape.targetSubjectsOf.should.be.empty;
			propertyShape.constraints.should.be.empty;
			propertyShape.messages.should.be.empty;
			propertyShape.deactivated.should.be.false;
			propertyShape.severity.value.should.equal(ViolationSeverityIRI.value);
		});
	});
});