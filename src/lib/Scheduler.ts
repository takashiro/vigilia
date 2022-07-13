import { EventEmitter } from 'events';

import { Runnable } from '../model/Runnable';

interface Scheduler {
	on(event: 'error', listener: (error: Error) => void): this;

	once(event: 'error', listener: (error: Error) => void): this;

	off(event: 'error', listener: (error: Error) => void): this;

	emit(event: 'error', error: Error): boolean;
}

class Scheduler extends EventEmitter {
	protected runnable: Runnable;

	protected frequency: number;

	protected timer?: NodeJS.Timer;

	protected running = false;

	constructor(runnable: Runnable, frequency = 24 * 3600 * 1000) {
		super();
		this.runnable = runnable;
		this.frequency = frequency;
	}

	getFrequency(): number {
		return this.frequency;
	}

	setFrequency(frequency: number): void {
		this.frequency = frequency;
	}

	start(): void {
		if (this.timer) {
			return;
		}

		this.run();

		this.timer = setInterval(() => this.run(), this.frequency);
	}

	stop(): void {
		if (!this.timer) {
			return;
		}
		clearInterval(this.timer);
		delete this.timer;
	}

	isStarted(): boolean {
		return Boolean(this.timer);
	}

	isStopped(): boolean {
		return !this.timer && !this.running;
	}

	isStopping(): boolean {
		return !this.timer && this.running;
	}

	isRunning(): boolean {
		return this.running;
	}

	protected async run(): Promise<void> {
		try {
			this.running = true;
			if ('exec' in this.runnable) {
				await this.runnable.exec();
			} else {
				await this.runnable();
			}
		} catch (error) {
			const e = error instanceof Error ? error : new Error(String(error));
			this.emit('error', e);
		} finally {
			this.running = false;
		}
	}
}

export default Scheduler;
