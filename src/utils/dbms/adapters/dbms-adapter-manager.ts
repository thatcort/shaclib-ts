import { RdfDBMSAdapter } from './rdf-dbms-adapter';
import { NotSupportedError } from 'rdflib-ts';
import { Fuseki250RestAdapter } from './rest/fuseki-adapters';

export class DBMSAdapterManager {
	private adapters: Map<string, Function>;

	public constructor() {
		this.adapters = new Map<string, any>();
		this.registerSupportedAdapters();
	}

	public createAdapter(dbmsName: string, dbmsVersion: string, dbmsUrl?: string): RdfDBMSAdapter {
		let adapter = this.adapters.get(dbmsName + dbmsVersion);

		if (!adapter) {
			throw new NotSupportedError(`Adapter for '${dbmsName} - v${dbmsVersion}' is not supported`);
		}

		return Reflect.construct(adapter, dbmsUrl ? [dbmsUrl] : []);
	}


	public registerAdapter(dbmsName: string, dbmsVersion: string, adapterConstructor: Function): void {
		this.adapters.set(dbmsName + dbmsVersion, adapterConstructor);
	}

	private registerSupportedAdapters(): void {
		this.registerAdapter('Apache Jena Fuseki', '2.5.0', Fuseki250RestAdapter);
	}
}

export const DBMSAdapterManagerInstance: DBMSAdapterManager = new DBMSAdapterManager();