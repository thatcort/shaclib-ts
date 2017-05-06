import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
let should = chai.should();

import * as uuid from 'uuid/v4';

import { RdfStore } from 'rdflib-ts';
import { TestHelper } from '../../../../../helpers/test-helper';
import { Fuseki250RestAdapter } from '../../../../../../src/utils/dbms/adapters/rest/fuseki-adapters';

process.env.LOCALHOST = process.env.DOCKERHOST || 'localhost';

describe('Apache Jena Fuseki v2.5.0 - Integration', () => {
	let adapter = new Fuseki250RestAdapter('http://localhost:3030');
	let store: RdfStore = null;

	let fusekiServerPID;

	before(async () => {
		fusekiServerPID = await TestHelper.spawnFusekiServerAsync();
	});

	after(async () => {
		TestHelper.killProcess(fusekiServerPID);
	});

	context('createRdfStoreAsync', () => {
		it('should create rdf store on target server', async () => {
			store = await adapter.createRdfStoreAsync(`FusekiTestStore_${uuid()}`);
			store.should.be.ok;
			store.storeSize.should.equal(0);
			
			let queryResult = await store.exportQuadsAsync();
			queryResult.should.be.empty;
		});
	});

	context('deleteRdfStoreAsync', () => {
		it('should delete rdf store from target server', async () => {
			await adapter.deleteRdfStoreAsync(store);
			return store.exportQuadsAsync().should.be.rejected;
		});

		it('should do nothing if null or undefined store provided', () => {
			adapter.deleteRdfStoreAsync(null).should.eventually.be.fulfilled;
			adapter.deleteRdfStoreAsync(undefined).should.eventually.be.fulfilled;
		});
	});
});