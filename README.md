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


## Development
---

Want to contribute? Great!
If you are using Visual Studio Code, there is default development setup in `.vscode` folder. There are configured tasks for compile, test and build, and default launch configuration with `main.ts` as entry point, and compile as pre launch task. Be aware that working directory when debugging is not project root, it it `compiled` directory (directory where compiled .js files reside).
There is also `keybindings.json` file with custom bindings which you can copy to your local keybinding.json file (File -> Preferences -> Keyboard Shortcuts). It's just 3 shortcuts, `f4` to run tests, `f6` to run build task and `ctrl+k, ctrl+d` to format code.
After cloning code, run `npm install` to install dependencies, then run `npm run build` to build library and `npm link rdflib-ts` to link library locally for test purposes. 
To run tests, run `npm test` command. For running integration test, instance of Apache Jena Fuseki 2.5.0 server must be running on port 3030. You can download and run it your self, or you can use docker image specified in `bitbucket-pipelines.yml` file and make sure to have same environment as one used for continuous integration and testing.

## Todos
---

 - Reach 100% code coverage
 - Write JSDoc
 - Setup docker containers with fuseki server and static file server for integration and e2e tests
 - Make it browser friendly

License
----

MIT
