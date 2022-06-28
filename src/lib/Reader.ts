import { EventEmitter } from 'events';
import { Readable } from 'stream';

import FeedItem from '../model/FeedItem';

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

abstract class Reader extends EventEmitter {
	protected input: Readable;

	protected inChannel = false;

	protected tag?: string;

	protected item?: FeedItem;

	constructor(input: Readable) {
		super();

		this.input = input;
	}

	abstract run(): void;
}

export default Reader;
