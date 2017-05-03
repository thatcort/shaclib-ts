import 'mocha';
import * as chai from 'chai';

let should = chai.should();

import { DBMSAdapterManager } from '../../../../../src/utils/dbms/adapters/dbms-adapter-manager';
import { Fuseki250RestAdapter } from '../../../../../src/utils/dbms/adapters/rest/fuseki-adapters';

describe('DBMSAdapterManager - Unit', () => {
	context('constructor', () => {
		it('should register default supported adapters', () => {
			let manager = new DBMSAdapterManager();

			let fuseki = manager.createAdapter('Apache Jena Fuseki', '2.5.0', 'http://localhost:3030');
			fuseki.should.be.ok;

			let brightstar = manager.createAdapter('BrightstarDB', '1.13.3', 'http://localhost:3030');
			brightstar.should.be.ok; 
		});
	});

	context('registerAdapter', () => {
		it('should register adapter for specified db and version', () => {
			let manager = new DBMSAdapterManager();
			manager.registerAdapter('Apache Jena Fuseki', '2.5.1', Fuseki250RestAdapter);

			let fuseki = manager.createAdapter('Apache Jena Fuseki', '2.5.1', 'http://localhost:3030');
			fuseki.should.be.ok;

		});
	});
});