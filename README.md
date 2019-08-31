# SHACLib.ts

SHACLib.ts is a TypeScript implementation of the W3C’s Shapes Constraint Language (SHACL).
This implementation is SPARQL based, meaning that SPARQL 1.1 queries are used in the implementation of constraint components.
Since there is no in-memory RDF store with full SPARQL 1.1 support available, it can be integrated (via HTTP) with servers like Apache Jena Fuseki, BrightstarDB, and others.
If you want to contribute regarding the in-memory RDF store, it can be done on the project - RDFLib.ts library (https://bitbucket.org/vladimir_djurdjevic/rdflib.ts).

At present, the implemented workflow for SHACL validation is as follows:

1.  Creation of RDF stores (SPARQL endpoints) on targeted server (Apache Jena Fuseki 2.5.0)
2.  Parsing and importing input shapes and RDF data documents (.ttl, .trig, .nt, .nq, .jsonld) into created RDF stores.
3.  Using SPARQL 1.1 queries, resolving SHACL shapes and constraint components, and conducting validation.

Currently, the library is work in progress. Contributions and suggestions are very welcome.

## Installation

---

`npm install --save shaclib-ts`

## Usage

---

There are two ways of usage, cli and programmatically.

##### SHACL - CLI

You can use shacl-cli from command line (shell) to validate local or remote RDF documents (supported syntaxes are .ttl, .trig, .nt, .nq, and .jsonld).
When remote documents are validated, ensure that a link ends with a file extension so CLI can resolve appropriate parser. For example, http://somefileserver.com/somerdfdocument.ttl.
Until an in-memory RDF store with SPARQL 1.1 support is available, you must have Apache Jena Fuseki 2.5.0 server up and running. Its address and port can be specified through CLI options.
To see available CLI options type: shacl-cli -h.

![alt text](http://i64.tinypic.com/2la7eok.png)
![alt text](http://i64.tinypic.com/2cnaxys.png)

##### Library usage

You can also use ShaclShapeParser and ShaclValidator classes directly.
If you want to validate data that is already available through some SPARQL endpoint, you can use RemoteSparqlEndpoint class available from the RDFLib.ts (https://www.npmjs.com/package/rdflib-ts) as proxy for communication with endpoint, and pass it to ShaclShapeParser and ShaclValidator class instances.

```typescript
import { ShaclShapeParser, ShaclValidator } from 'shaclib-ts';
import { RemoteSparqlEndpoint, RdfDataExporter } from 'rdflib-ts';

// Create proxy to shape graph and pass it to shape parser
// This will create in memory representation of shapes
// Which can be passed to shacl validator
let shapeStore = new RemoteSparqlEndpoint('ShapeGraph', 'http://somesparqlserver.com');
let shapeParser = new ShaclShapeParser();
let shapes = await shapeParser.parseShapesAsync(shapeStore);

// Create proxy to data graph and pass it to shacl validator along with parsed shapes
// Result is in memory representation of shacl validation report
// which can be converter to NQuad[] and exported using RdfDataExporter from `rdflib-ts`;
let dataStore = new RemoteSparqlEndpoint('DataGraph', 'http://somesparqlserver.com');
let shaclValidator = new ShaclValidator();
let report = await shaclValidator.validateAsync(shapes, dataStore);

let exporter = new RdfDataExporter({ unskolemize: true });
await exporter.exportRdfDataAsync(report.toNQuads(), 'report.ttl');
```

## Testing

---

To run all tests, run `npm test` command. Different tests can be run separately with `npm run test:unit`, `npm run test:integration` and `npm run test:e2e` commands.

## License

MIT
