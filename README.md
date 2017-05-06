# SHACLib.ts

TypeScript implementation of the evolving W3C Shapes Constraint Language (SHACL). This library is work in progress. Contributions are very welcome. Implementation is SPARQL based, which means it uses SPARQL 1.1 queries in constraint component implementation. Since there is no in memory rdf store with full SPARQL 1.1 support available, it integrates (over HTTP) with servers like Apache Jena Fuseki, BrightstarDB, etc. If you want to contribute on that matter, you can do it on RDFLib.ts (https://bitbucket.org/vladimir_djurdjevic/rdflib.ts) library, which is used for RDF stuff. For now, workflow for shacl validation is:
	1. Create rdf stores (SPARQL endpoints) on target server (Apache Jena Fuseki 2.5.0)
	2. Parse and import input shapes and target rdf data documents (.ttl, .trig, .nt, .nq, .jsonld) into created stores.
	3. Using SPARQL 1.1 queries, resolve SHACL shapes and constraint components, and start validation.

## Installation
---

`npm install --save shaclib-ts`

## Usage
---
There are two ways of usage, cli and programmatically. 
##### SHACL - CLI
You can use shacl-cli from command line (shell) to validate local or remote rdf documents (.ttl, .trig, .nt, .nq, .jsonld). If validating remote documents, make sure that link ends with file extension so cli can resolve appropriate parser, for example: http://somefileserver.com/somerdfdocument.ttl Until in memory rdf store with SPARQL 1.1 support gets available, you must have Apache Jena Fuseki 2.5.0 server up and running, and it's address and port can be specified through cli options. To see available cli options type: `shacl-cli -h`.

![alt text](http://i64.tinypic.com/2la7eok.png)
![alt text](http://i64.tinypic.com/2cnaxys.png)

##### Library usage
You can also use `ShaclShapeParser` and `ShaclValidator` classes directly. If you want to validate date that is already available through some SPARQL endpoint, you can use `RemoteSparqlEndpoint` class from RDFLib.ts (https://www.npmjs.com/package/rdflib-ts) as proxy for communication with endpoint, and pass it to `ShaclShapeParser` and `ShaclValidator`.

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



## Development
---

Want to contribute? Great!
If you are using Visual Studio Code, there is default development setup in `.vscode` folder. There are configured tasks for compile, test and build, and default launch configuration with `main.ts` as entry point, and compile as pre launch task. Be aware that working directory when debugging is not project root, it it `compiled` directory (directory where compiled .js files reside).
There is also `keybindings.json` file with custom bindings which you can copy to your local keybinding.json file (File -> Preferences -> Keyboard Shortcuts). It's just 3 shortcuts, `f4` to run tests, `f6` to run link (build and npm link) task and `ctrl+k, ctrl+d` to format code.
After cloning code, run `npm install` to install dependencies, then run `npm run link` to build library and link library locally for test purposes. 

## Testing
---

To run all tests, run `npm test` command. Different tests can be run separately with `npm run test:unit`, `npm run test:integration` and `npm run test:e2e` commands. 

## Todos
---

 - Add ill-formed shapes handling
 - Implement SHACL SPARQL and SHACL JavaScript extensions
 - Systematically test via test case library
 - Reach 100% code coverage
 - Write JSDoc
 - Make it browser friendly

License
----

MIT
