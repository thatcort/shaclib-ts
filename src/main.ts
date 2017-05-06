import { TestHelper } from '../test/helpers/test-helper';
// USE THIS AS ENTRY POINT FUNCTION FOR MANUAL TESTING
// THIS IS ENTRY POINT FOR NODE DEBUGGER CONFIGURATION
// WHICH CAN BE RUN USING F5 KEY
(async () => {
	await TestHelper.runShaclValidator('C:/Development/Bitbucket/vladimir_djurdjevic/shaclib-ts/compiled/test/datasets/w3c/ttl/1_4_shacl_example_shape_graph.ttl', 'C:/Development/Bitbucket/vladimir_djurdjevic/shaclib-ts/compiled/test/datasets/w3c/ttl/1_4_shacl_example_data_graph.ttl');
	process.exit();
})();
