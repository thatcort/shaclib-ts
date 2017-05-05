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

	context('4.1.2 sh:datatype', () => {
		it('should produce two validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_1_2_sh_datatype_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_1_2_sh_datatype_example_data_graph.ttl');
			report.results.should.have.lengthOf(2);

			TestHelper.hasValidationResult(report, 'sh:DatatypeConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:age', 'twenty two').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:DatatypeConstraintComponent', 'sh:Violation', 'ex:Carol', 'ex:age', '23').should.be.true;
		});
	});

	context('4.1.3 sh:nodeKind', () => {
		it('should produce one validation result', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_1_3_sh_nodeKind_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_1_3_sh_nodeKind_example_data_graph.ttl');
			report.results.should.have.lengthOf(1);

			TestHelper.hasValidationResult(report, 'sh:NodeKindConstraintComponent', 'sh:Violation', 'Bob', undefined, 'Bob').should.be.true;
		});
	});

	context('4.2.1 sh:minCount', () => {
		it('should produce one validation result', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_2_1_sh_minCount_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_2_1_sh_minCount_example_data_graph.ttl');
			report.results.should.have.lengthOf(1);

			TestHelper.hasValidationResult(report, 'sh:MinCountConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:name').should.be.true;
		});
	});

	context('4.2.2 sh:maxCount', () => {
		it('should not produce validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_2_2_sh_maxCount_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_2_2_sh_maxCount_example_data_graph.ttl');
			report.results.should.be.empty;
		});
	});

	context('4.3 Value Range Constraint Components', () => {
		it('should produce seven validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_3_value_range_constraint_components_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_3_value_range_constraint_components_example_data_graph.ttl');
			report.results.should.have.lengthOf(7);

			TestHelper.hasValidationResult(report, 'sh:MinInclusiveConstraintComponent', 'sh:Violation', 'ex:Ted', 'ex:age', 'twenty one').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxInclusiveConstraintComponent', 'sh:Violation', 'ex:Ted', 'ex:age', 'twenty one').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxInclusiveConstraintComponent', 'sh:Violation', 'ex:Alice', 'ex:age', '220').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MinExclusiveConstraintComponent', 'sh:Violation', 'ex:Ted', 'ex:pets', 'twenty one').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MinExclusiveConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:pets', '1').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxExclusiveConstraintComponent', 'sh:Violation', 'ex:Ted', 'ex:pets', 'twenty one').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxExclusiveConstraintComponent', 'sh:Violation', 'ex:Alice', 'ex:pets', '5').should.be.true;
		});
	});

	context('4.4 sh:minLength and sh:maxLength', () => {
		it('should produce two validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_4_sh_min_max_length_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_4_sh_min_max_length_example_data_graph.ttl');
			report.results.should.have.lengthOf(2);

			TestHelper.hasValidationResult(report, 'sh:MinLengthConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:password', '12345').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:MaxLengthConstraintComponent', 'sh:Violation', 'ex:Alice', 'ex:password', '1234567890ABC').should.be.true;
		});
	});

	context('4.4.3 sh:pattern', () => {
		it('should produce one validation result', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_4_3_sh_pattern_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_4_3_sh_pattern_example_data_graph.ttl');
			report.results.should.have.lengthOf(1);

			TestHelper.hasValidationResult(report, 'sh:PatternConstraintComponent', 'sh:Violation', 'ex:Carol', 'ex:bCode', 'C103').should.be.true;
		});
	});

	context('4.4.4 sh:languageIn', () => {
		it('should produce three validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_4_4_sh_languageIn_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_4_4_sh_languageIn_example_data_graph.ttl');
			report.results.should.have.lengthOf(3);

			TestHelper.hasValidationResult(report, 'sh:LanguageInConstraintComponent', 'sh:Violation', 'ex:Berg', 'ex:prefLabel', 'Berg').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:LanguageInConstraintComponent', 'sh:Violation', 'ex:Berg', 'ex:prefLabel', 'ex:BergLabel').should.be.true;
		});
	});

	context('4.4.5 sh:uniqueLang', () => {
		it('should produce one validation result', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_4_5_sh_uniqueLang_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_4_5_sh_uniqueLang_example_data_graph.ttl');
			report.results.should.have.lengthOf(1);

			TestHelper.hasValidationResult(report, 'sh:UniqueLangConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:label').should.be.true;
		});
	});

	context('4.5.1 sh:equals', () => {
		it('should not produce validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_5_1_sh_equals_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_5_1_sh_equals_example_data_graph.ttl');
			report.results.should.be.empty;
		});
	});

	context('4.5.2 sh:disjoint', () => {
		it('should produce one validation result', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_5_2_sh_disjoint_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_5_2_sh_disjoint_example_data_graph.ttl');
			report.results.should.have.lengthOf(1);

			TestHelper.hasValidationResult(report, 'sh:DisjointConstraintComponent', 'sh:Violation', 'ex:Germany', 'ex:prefLabel', 'Germany').should.be.true;
		});
	});

	context('4.5.3-4 sh:lessThan and sh:lessThanOrEquals', () => {
		it('should produce two validation results', async () => {
			let report = await TestHelper.runShaclValidator('test/datasets/w3c/ttl/4_5_3-4_sh_lessThan-lessThanOrEquals_example_shape_graph.ttl', 'test/datasets/w3c/ttl/4_5_3-4_sh_lessThan-lessThanOrEquals_example_data_graph.ttl');
			report.results.should.have.lengthOf(2);

			TestHelper.hasValidationResult(report, 'sh:LessThanConstraintComponent', 'sh:Violation', 'ex:Bob', 'ex:cats', '6').should.be.true;
			TestHelper.hasValidationResult(report, 'sh:LessThanOrEqualsConstraintComponent', 'sh:Violation', 'ex:Alice', 'ex:pigs', '8').should.be.true;
		});
	});
});