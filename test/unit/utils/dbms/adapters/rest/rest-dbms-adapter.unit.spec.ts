import { RestDBMSAdapter } from '../../../../../../src/utils/dbms/adapters/rest/rest-dbms-adapter';

describe('RestDBMSAdapter - Unit', () => {
	context('constructor', () => {
		it('should set dbmsName, dbmsVersion and options properties', () => {
			const restAdapter = new RestDBMSAdapter('Some DBMS', '1.0.0', {
				contentType: 'application/json',
				dbmsBaseUrl: 'http://localhost:3030',
				storeAccessEndpoint: '$',
				storeManagementEndpoint: '',
				storeNameParameter: { name: 'dbName' },
				storeTypeParameter: { name: 'dbType', type: 'mem' }
			});

			restAdapter.dbmsName.should.equal('Some DBMS');
			restAdapter.dbmsVersion.should.equal('1.0.0');
			restAdapter.options.contentType.should.equal('application/json');
			restAdapter.options.dbmsBaseUrl.should.equal('http://localhost:3030');
			restAdapter.options.storeAccessEndpoint.should.equal('$');
			restAdapter.options.storeManagementEndpoint.should.equal('');
			restAdapter.options.storeNameParameter.name.should.equal('dbName');
			restAdapter.options.storeTypeParameter.name.should.equal('dbType');
			restAdapter.options.storeTypeParameter.type.should.equal('mem');
		});
	});
});
