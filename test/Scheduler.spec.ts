import Scheduler from '../src/lib/Scheduler';

jest.useFakeTimers();

function idle(msecs: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, msecs);
	});
}

describe('Execute an async function', () => {
	const worker = jest.fn(() => idle(50));
	const scheduler = new Scheduler(worker);

	it('is not started', () => {
		scheduler.setFrequency(100);

		expect(scheduler.isStarted()).toBe(false);
		expect(scheduler.isStopped()).toBe(true);
		expect(scheduler.isRunning()).toBe(false);
	});

	it('is started', () => {
		scheduler.start();

		expect(scheduler.isStarted()).toBe(true);
		expect(scheduler.isStopped()).toBe(false);
	});

	it('is running', () => {
		expect(worker).toBeCalledTimes(1);
		expect(scheduler.isRunning()).toBe(true);
	});

	it('is not running soon', async () => {
		jest.advanceTimersByTime(50);
		await Promise.resolve();
		expect(worker).toBeCalledTimes(1);
		expect(scheduler.isRunning()).toBe(false);
	});

	it('is running again after 50ms', async () => {
		jest.advanceTimersByTime(50);
		await Promise.resolve();
		expect(worker).toBeCalledTimes(2);
		expect(scheduler.isRunning()).toBe(true);
	});

	it('is stopping', () => {
		scheduler.stop();

		expect(scheduler.isStarted()).toBe(false);
		expect(scheduler.isStopped()).toBe(false);
		expect(scheduler.isStopping()).toBe(true);
	});

	it('is stopped after 50ms', () => {
		jest.advanceTimersByTime(50);

		expect(scheduler.isStopped()).toBe(false);
		expect(scheduler.isStopping()).toBe(true);
	});

	it('will not be running after 50ms', () => {
		jest.advanceTimersByTime(50);

		expect(scheduler.isStopped()).toBe(true);
	});
});

describe('Handle errors', () => {
	const worker = () => {
		throw new Error('unknown');
	};
	const scheduler = new Scheduler(worker, 100);

	it('should handle an error', async () => {
		const handler = jest.fn();
		scheduler.once('error', handler);
		scheduler.start();
		await Promise.resolve();
		expect(handler).toBeCalledTimes(1);
	});

	it('should handle multiple errors', async () => {
		const handler = jest.fn();
		scheduler.on('error', handler);

		jest.advanceTimersByTime(100);
		await Promise.resolve();
		expect(handler).toBeCalledTimes(1);

		jest.advanceTimersByTime(100);
		await Promise.resolve();
		expect(handler).toBeCalledTimes(2);
	});
});
