import { RestDBMSAdapter } from './rest-dbms-adapter';

export class Fuseki250RestAdapter extends RestDBMSAdapter {
	public constructor(serverUrl: string) {
		super('Apache Jena Fuseki', '2.5.0', {
			dbmsBaseUrl: serverUrl,
			storeManagementEndpoint: `${serverUrl}/$/datasets`,
			storeAccessEndpoint: serverUrl,
			storeNameParameter: {
				name: 'dbName'
			},
			storeTypeParameter: {
				name: 'dbType',
				type: 'mem'
			},
			contentType: 'application/x-www-form-urlencoded'
		});
	}
}