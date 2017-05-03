import { RestDBMSAdapter } from './rest-dbms-adapter';

export class BrightstarDB1133RestAdapter extends RestDBMSAdapter {
	public constructor(serverUrl: string) {
		super('BrightstarDB', '1.13.3', {
			dbmsBaseUrl: serverUrl,
			storeManagementEndpoint: `${serverUrl}/brightstar`,
			storeAccessEndpoint: `${serverUrl}/brightstar`,
			storeNameParameter: {
				name: 'StoreName'
			},
			storeTypeParameter: {
				name: 'PersistenceType',
				type: '1'
			},
			contentType: 'application/json'
		});
	}
}