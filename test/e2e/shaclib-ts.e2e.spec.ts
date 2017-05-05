import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { TestHelper } from '../helpers/test-helper';

process.env.LOCALHOST = process.env.DOCKERHOST || 'localhost';

describe('SHACLib.ts', () => {
	let fusekiServerPID;

	before(async () => {
		fusekiServerPID = await TestHelper.spawnFusekiServerAsync();
	});

	after(async () => {
		TestHelper.killProcess(fusekiServerPID);
	});

	context('1.4 SHACL Example', () => {
		it('should produce 4 validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/1_4_shacl_example_shape_graph.ttl', 'test/datasets/w3c/ttl/1_4_shacl_example_data_graph.ttl');
			report.results.should.have.lengthOf(4);

			TestHelper.hasValidationResult(report, 'sh:PatternConstraintComponent', 'sh:Violation', 'ex:Alice', 'ex:ssn', '987-65-432A').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxCountConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:ssn').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:ClassConstraintComponent', 'sh:Violation', 'ex:Calvin', 'ex:worksFor', 'ex:UntypedCompany').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:ClosedConstraintComponent', 'sh:Violation', 'ex:Calvin', 'ex:birthDate', '1971-07-07').should.be.true;
		});
	});

	context('2.1.4 Declaring the Severity of a Shape', () => {
		it('should produce two validation results with appropriate severity set', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/2_1_4_severity_example_shape_graph.ttl', 'test/datasets/w3c/ttl/2_1_4_severity_example_data_graph.ttl');
			report.results.should.have.lengthOf(2);

			TestHelper.hasValidationResult(report, 'sh:DatatypeConstraintComponent', 'sh:Warning', 'ex:MyInstance', 'ex:myProperty', 'http://toomanycharacters').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxLengthConstraintComponent', 'sh:Violation', 'ex:MyInstance', 'ex:myProperty', 'http://toomanycharacters').should.be.true;
		});
	});


});