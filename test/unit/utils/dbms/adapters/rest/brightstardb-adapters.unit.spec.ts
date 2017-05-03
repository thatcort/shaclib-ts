import 'mocha';
import * as chai from 'chai';

let should = chai.should();

import { BrightstarDB1133RestAdapter } from '../../../../../../src/utils/dbms/adapters/rest/brightstardb-adapters';

describe('BrightstarDB1133RestAdapter - Unit', () => {
	context('constructor', () => {
		it('should set dbmsName, dbmsVersion and options properties appropriate for BrightstarDB v1.13.3 adapter', () => {
			let restAdapter = new BrightstarDB1133RestAdapter('http://localhost:3030');

			restAdapter.dbmsName.should.equal('BrightstarDB');
			restAdapter.dbmsVersion.should.equal('1.13.3');
			restAdapter.options.contentType.should.equal('application/json');
			restAdapter.options.dbmsBaseUrl.should.equal('http://localhost:3030');
			restAdapter.options.storeAccessEndpoint.should.equal('http://localhost:3030/brightstar');
			restAdapter.options.storeManagementEndpoint.should.equal('http://localhost:3030/brightstar');
			restAdapter.options.storeNameParameter.name.should.equal('StoreName');
			restAdapter.options.storeTypeParameter.name.should.equal('PersistenceType');
			restAdapter.options.storeTypeParameter.type.should.equal('1');
		});
	});
});