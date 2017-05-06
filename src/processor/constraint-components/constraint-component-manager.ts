import { ConstraintComponent } from './constraint-component';
import { InConstraintComponent } from './core/other/in-constraint-component';
import { OrConstraintComponent } from './core/logical/or-constraint-component';
import { AndConstraintComponent } from './core/logical/and-constraint-component';
import { NotConstraintComponent } from './core/logical/not-constraint-component';
import { NodeConstraintComponent } from './core/shape-based/node-constraint-component';
import { XoneConstraintComponent } from './core/logical/xone-constraint-component';
import { ClassConstraintComponent } from './core/value-type/class-constraint-component';
import { EqualsConstraintComponent } from './core/property-pair/equals-constraint-component';
import { ClosedConstraintComponent } from './core/other/closed-constraint-component';
import { IShaclConstraintParameter } from '../../model/shacl-constraint-parameter';
import { IRI, InvalidOperationError } from 'rdflib-ts';
import { PatternConstraintComponent } from './core/string-based/pattern-constraint-component';
import { DatatypeConstraintComponent } from './core/value-type/datatype-constraint-component';
import { MinCountConstraintComponent } from './core/cardinality/min-count-constraint-component';
import { MaxCountConstraintComponent } from './core/cardinality/max-count-constraint-component';
import { HasValueConstraintComponent } from './core/other/has-value-constraint-component';
import { DisjointConstraintComponent } from './core/property-pair/disjoint-constraint-component';
import { LessThanConstraintComponent } from './core/property-pair/less-than-constraint-component';
import { NodeKindConstraintComponent } from './core/value-type/node-kind-constraint-component';
import { MaxLengthConstraintComponent } from './core/string-based/max-length-constraint-component';
import { MinLengthConstraintComponent } from './core/string-based/min-length-constraint-component';
import { LanguageInConstraintComponent } from './core/string-based/language-in-constraint-component';
import { UniqueLangConstraintComponent } from './core/string-based/unique-lang-constraint-component';
import { MaxExclusiveConstraintComponent } from './core/value-range/max-exclusive-constraint-component';
import { MaxInclusiveConstraintComponent } from './core/value-range/max-inclusive-constraint-component';
import { MinExclusiveConstraintComponent } from './core/value-range/min-exclusive-constraint-component';
import { MinInclusiveConstraintComponent } from './core/value-range/min-inclusive-constraint-component';
import { PropertyShapeConstraintComponent } from './core/shape-based/property-shape-constraint-component';
import { LessThanOrEqualsConstraintComponent } from './core/property-pair/less-than-or-equals-constraint-component';
import { QualifiedValueShapeConstraintComponent } from './core/shape-based/qualified-value-shape-constraint-component';

export class ConstraintComponentManager {
	private components: ConstraintComponent[];

	public constructor() {
		this.components = [];
		this.registerCoreComponents();
	}

	public registerCoreComponents() {
		this.registerComponent(new MaxCountConstraintComponent());
		this.registerComponent(new MinCountConstraintComponent());

		this.registerComponent(new AndConstraintComponent());
		this.registerComponent(new NotConstraintComponent());
		this.registerComponent(new OrConstraintComponent());
		this.registerComponent(new XoneConstraintComponent());

		this.registerComponent(new ClosedConstraintComponent());
		this.registerComponent(new HasValueConstraintComponent());
		this.registerComponent(new InConstraintComponent());

		this.registerComponent(new DisjointConstraintComponent());
		this.registerComponent(new EqualsConstraintComponent());
		this.registerComponent(new LessThanConstraintComponent());
		this.registerComponent(new LessThanOrEqualsConstraintComponent());

		this.registerComponent(new NodeConstraintComponent());
		this.registerComponent(new PropertyShapeConstraintComponent());
		this.registerComponent(new QualifiedValueShapeConstraintComponent());

		this.registerComponent(new LanguageInConstraintComponent());
		this.registerComponent(new MaxLengthConstraintComponent());
		this.registerComponent(new MinLengthConstraintComponent());
		this.registerComponent(new PatternConstraintComponent());
		this.registerComponent(new UniqueLangConstraintComponent());

		this.registerComponent(new MaxExclusiveConstraintComponent());
		this.registerComponent(new MaxInclusiveConstraintComponent());
		this.registerComponent(new MinExclusiveConstraintComponent());
		this.registerComponent(new MinInclusiveConstraintComponent());

		this.registerComponent(new ClassConstraintComponent());
		this.registerComponent(new DatatypeConstraintComponent());
		this.registerComponent(new NodeKindConstraintComponent());
	}

	public registerComponent(component: ConstraintComponent) {
		this.components.push(component);
	}

	public getConstraintComponentByParameter(parameterIRI: IRI): ConstraintComponent {
		return this.components.find(c => c.parameters.some(p => p.iri.value === parameterIRI.value));
	}

	public getConstraintParameterByIRI(parameterIRI: IRI): IShaclConstraintParameter {
		return this.getConstraintComponentByParameter(parameterIRI).parameters.find(p => p.iri.value === parameterIRI.value);
	}

	public getAllConstraintParameters(): IShaclConstraintParameter[] {
		let parameters = [];

		for (let component of this.components) {
			parameters = parameters.concat(component.parameters);
		}

		return parameters;
	}
}

export const CommonConstraintComponentManager: ConstraintComponentManager = new ConstraintComponentManager();