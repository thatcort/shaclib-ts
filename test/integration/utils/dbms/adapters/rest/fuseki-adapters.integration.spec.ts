import * as uuid from 'uuid/v4';

import { RdfStore } from 'rdflib-ts';
import { Fuseki250RestAdapter } from '../../../../../../src/utils/dbms/adapters/rest/fuseki-adapters';

describe('Apache Jena Fuseki v2.5.0 - Integration', () => {
	const adapter = new Fuseki250RestAdapter('http://localhost:3030');
	let store: RdfStore = null;

	before(async () => {
		store = await adapter.createRdfStoreAsync(`FusekiTestStore_${uuid()}`);
	});
	
	context('createRdfStoreAsync', () => {
		it('should create rdf store on target server', async () => {
			store.should.be.ok;
			store.storeSize.should.equal(0);

			const queryResult = await store.exportQuadsAsync();
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
