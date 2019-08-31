import { RdfStore } from 'rdflib-ts';

export abstract class RdfDBMSAdapter {
	dbmsName: string;
	dbmsVersion: string;

	public constructor(dbmsName: string, dbmsVersion: string) {
		this.dbmsName = dbmsName;
		this.dbmsVersion = dbmsVersion;
	}

	public abstract createRdfStoreAsync(storeName: string): Promise<RdfStore>;

	public abstract deleteRdfStoreAsync(store: RdfStore): Promise<void>;
}
