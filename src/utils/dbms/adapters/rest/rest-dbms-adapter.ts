import * as http from 'superagent';

import { RdfDBMSAdapter } from '../rdf-dbms-adapter';
import { RdfStore, RemoteSparqlEndpoint } from 'rdflib-ts';

export interface IStoreNameParameter {
	name: string;
}

export interface IStoreTypeParameter {
	name: string;
	type: string;
}

export interface IRestDBMSAdapterOptions {
	dbmsBaseUrl: string;
	storeManagementEndpoint: string;
	storeAccessEndpoint: string;
	contentType: string;
	storeNameParameter: IStoreNameParameter;
	storeTypeParameter?: IStoreTypeParameter;
}

export class RestDBMSAdapter extends RdfDBMSAdapter {
	public options: IRestDBMSAdapterOptions;

	public constructor(dbmsName: string, dbmsVersion: string, options: IRestDBMSAdapterOptions) {
		super(dbmsName, dbmsVersion);
		this.options = options;
	}

	public async createRdfStoreAsync(storeName: string): Promise<RdfStore> {
		await http.post(`${this.options.storeManagementEndpoint}`)
				  .send(this.createRequestBody(storeName))
				  .set('Content-Type', this.options.contentType);

		return new RemoteSparqlEndpoint(storeName, `${this.options.storeAccessEndpoint}/${storeName}`);
	}

	public async deleteRdfStoreAsync(store: RdfStore): Promise<void> {
		if (!store) {
			return;
		}

		await http.delete(`${this.options.storeManagementEndpoint}/${store.storeName}`);
	}

	private createRequestBody(storeName: string): any {
		let body: any = {};
		body[this.options.storeNameParameter.name] = storeName;

		if (this.options.storeTypeParameter) {
			body[this.options.storeTypeParameter.name] = this.options.storeTypeParameter.type;
		}

		return body;
	}
}