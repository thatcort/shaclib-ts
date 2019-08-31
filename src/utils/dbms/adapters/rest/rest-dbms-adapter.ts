import * as http from 'superagent';

import { RdfDBMSAdapter } from '../rdf-dbms-adapter';
import { RdfStore, RemoteSparqlEndpoint } from 'rdflib-ts';

export interface StoreNameParameter {
	name: string;
}

export interface StoreTypeParameter {
	name: string;
	type: string;
}

export interface RestDBMSAdapterOptions {
	dbmsBaseUrl: string;
	storeManagementEndpoint: string;
	storeAccessEndpoint: string;
	contentType: string;
	storeNameParameter: StoreNameParameter;
	storeTypeParameter?: StoreTypeParameter;
}

export class RestDBMSAdapter extends RdfDBMSAdapter {
	public options: RestDBMSAdapterOptions;

	public constructor(dbmsName: string, dbmsVersion: string, options: RestDBMSAdapterOptions) {
		super(dbmsName, dbmsVersion);
		this.options = options;
	}

	public async createRdfStoreAsync(storeName: string): Promise<RdfStore> {
		await http
			.post(`${this.options.storeManagementEndpoint}`)
			.auth(process.env.STORE_USER, process.env.STORE_PASS)
			.send(this.createRequestBody(storeName))
			.set('Content-Type', this.options.contentType);

		return new RemoteSparqlEndpoint(storeName, `${this.options.storeAccessEndpoint}`);
	}

	public async deleteRdfStoreAsync(store: RdfStore): Promise<void> {
		if (!store) {
			return;
		}

		await http
			.delete(`${this.options.storeManagementEndpoint}/${store.storeName}`)
			.auth(process.env.STORE_USER, process.env.STORE_PASS);
	}

	private createRequestBody(storeName: string): any {
		const body: any = {};
		body[this.options.storeNameParameter.name] = storeName;

		if (this.options.storeTypeParameter) {
			body[this.options.storeTypeParameter.name] = this.options.storeTypeParameter.type;
		}

		return body;
	}
}
