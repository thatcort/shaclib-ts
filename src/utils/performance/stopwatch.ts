export class Stopwatch {
	private startTime: [number, number];

	public constructor() {
		this.start();
	}

	public start(): void {
		this.startTime = process.hrtime();
	}

	public elapsed(): string {
		let duration = process.hrtime(this.startTime);
		return `${Math.round(duration[0] * 1e3 + duration[1] * 1e-6)}ms`;
	}
}