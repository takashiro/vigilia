import { EventEmitter } from 'events';
import { Readable } from 'stream';

import FeedItem from '../model/FeedItem';
import { RunnableObject } from '../model/Runnable';
import Timezone from '../model/Timezone';

function padZero(num: number, length: number): string {
	return String(num).padStart(length, '0');
}

interface Reader {
	on(event: 'feed', listener: (feed: FeedItem) => void): this;
	on(event: 'end', listener: () => void): this;
	on(event: 'error', listener: (error: Error) => void): this;

	once(event: 'feed', listener: (feed: FeedItem) => void): this;
	once(event: 'end', listener: () => void): this;
	once(event: 'error', listener: (error: Error) => void): this;

	off(event: 'feed', listener: (feed: FeedItem) => void): this;
	off(event: 'end', listener: () => void): this;
	off(event: 'error', listener: (error: Error) => void): this;

	emit(event: 'feed', feed: FeedItem): boolean;
	emit(event: 'end'): this;
	emit(event: 'error', error: Error): boolean;
}

abstract class Reader extends EventEmitter implements RunnableObject {
	protected timezone: Timezone = {
		hour: 0,
		minute: 0,
	};

	protected input: Readable;

	protected inChannel = false;

	protected tag?: string;

	protected item?: FeedItem;

	constructor(input: Readable) {
		super();

		this.input = input;
	}

	getTimezone(): Timezone {
		return { ...this.timezone };
	}

	setTimezone(timezone: Partial<Timezone>): void {
		const {
			hour = 0,
			minute = 0,
		} = timezone;
		this.timezone.hour = hour;
		this.timezone.minute = minute;
	}

	parseDate(str: string): Date {
		if (str.match(/\+\d{1,2}:\d{1,2}$/)) {
			return new Date(str);
		}
		return new Date(`${str}+${padZero(this.timezone.hour, 2)}:${padZero(this.timezone.minute, 2)}`);
	}

	exec(): Promise<void> {
		this.run();
		return new Promise((resolve, reject) => {
			this.once('end', resolve);
			this.once('error', reject);
		});
	}

	protected abstract run(): void;
}

export default Reader;
