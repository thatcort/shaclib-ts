import { Fuseki250RestAdapter } from '../../../../../../src/utils/dbms/adapters/rest/fuseki-adapters';

describe('Fuseki250RestAdapter - Unit', () => {
	context('constructor', () => {
		it('should set dbmsName, dbmsVersion and options properties appropriate for Apache Jena Fuseki v2.5.0 adapter', () => {
			const restAdapter = new Fuseki250RestAdapter('http://localhost:3030');

			restAdapter.dbmsName.should.equal('Apache Jena Fuseki');
			restAdapter.dbmsVersion.should.equal('2.5.0');
			restAdapter.options.contentType.should.equal('application/x-www-form-urlencoded');
			restAdapter.options.dbmsBaseUrl.should.equal('http://localhost:3030');
			restAdapter.options.storeAccessEndpoint.should.equal('http://localhost:3030');
			restAdapter.options.storeManagementEndpoint.should.equal(
				'http://localhost:3030/$/datasets'
			);
			restAdapter.options.storeNameParameter.name.should.equal('dbName');
			restAdapter.options.storeTypeParameter.name.should.equal('dbType');
			restAdapter.options.storeTypeParameter.type.should.equal('mem');
		});
	});
});
