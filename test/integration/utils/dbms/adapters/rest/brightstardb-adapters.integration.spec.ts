import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
let should = chai.should();

import * as uuid from 'uuid/v4';

import { RdfStore } from 'rdflib-ts';
import { BrightstarDB1133RestAdapter } from '../../../../../../src/utils/dbms/adapters/rest/brightstardb-adapters';

describe('BrightstarDB 1.13.3 - Integration', () => {
	let adapter = new BrightstarDB1133RestAdapter('http://localhost:8090');
	let store: RdfStore = null;

	context('createRdfStoreAsync', () => {
		it('should create rdf store on target server', async () => {
			store = await adapter.createRdfStoreAsync(`BrightstarDBTestStore_${uuid()}`);
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