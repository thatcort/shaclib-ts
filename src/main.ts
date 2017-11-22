import { TestHelper } from "../test/helpers/test-helper";

// USE THIS AS ENTRY POINT FUNCTION FOR MANUAL TESTING
// THIS IS ENTRY POINT FOR NODE DEBUGGER CONFIGURATION
// WHICH CAN BE RUN USING F5 KEY
(async () => {
	process.env.LOCALHOST = 'localhost';
	let fusekiServerPID = await TestHelper.spawnFusekiServerAsync();

	let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/6_2_3_2_ask_based_validators_shape_graph.ttl', 'test/datasets/w3c/ttl/6_2_3_2_ask_based_validators_data_graph.ttl');

	TestHelper.killProcess(fusekiServerPID);
	process.exit();
})();
