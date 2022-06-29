import sax from 'sax';

import Reader from './Reader';

const enum TagName {
	Channel = 'CHANNEL',
	Item = 'ITEM',
	Link = 'LINK',
	Title = 'TITLE',
	Description = 'DESCRIPTION',
	PublishDate = 'PUBDATE',
	ContentLength = 'CONTENTLENGTH',
	Torrent = 'TORRENT',
	Enclosure = 'ENCLOSURE',
}

class RssReader extends Reader {
	run(): void {
		const stream = sax.createStream();
		stream.on('opentag', this.readOpenTag.bind(this));
		stream.on('text', this.readText.bind(this));
		stream.on('closetag', this.readCloseTag.bind(this));
		stream.on('end', () => this.emit('end'));
		this.input.pipe(stream);
	}

	protected readOpenTag(tag: sax.Tag | sax.QualifiedTag): void {
		if (this.inChannel) {
			this.readChannel(tag);
		} else if (!tag.isSelfClosing && tag.name === TagName.Channel) {
			this.inChannel = true;
		}
	}

	protected readCloseTag(tag: string): void {
		if (tag === TagName.Channel) {
			if (this.inChannel) {
				this.inChannel = false;
			} else {
				this.emit('error', new Error(`Unexpected close tag: ${tag}`));
			}
		} else if (tag === TagName.Item) {
			const { item } = this;
			if (item) {
				delete this.item;
				this.emit('feed', item);
			} else {
				this.emit('error', new Error(`Unexpected close tag ${tag} in <channel>`));
			}
		} else if (tag === this.tag) {
			delete this.tag;
		}
	}

	protected readText(text: string): void {
		const { item } = this;
		if (!item) {
			return;
		}

		const { torrent } = item;
		if (torrent) {
			switch (this.tag) {
			case TagName.Link:
				torrent.link = text;
				break;
			case TagName.PublishDate:
				torrent.pubDate = this.parseDate(text);
				break;
			case TagName.ContentLength:
				torrent.contentLength = Number.parseInt(text, 10);
				break;
			default:
				break;
			}
		} else {
			switch (this.tag) {
			case TagName.Link:
				item.link = text;
				break;
			case TagName.Title:
				item.title = text;
				break;
			case TagName.Description:
				item.description = text;
				break;
			default:
				break;
			}
		}
	}

	protected readChannel(tag: sax.Tag | sax.QualifiedTag): void {
		if (this.item) {
			this.readItem(tag);
		} else if (!tag.isSelfClosing && tag.name === TagName.Item) {
			this.item = {
				link: '',
				title: '',
				description: '',
			};
		}
	}

	protected readItem(tag: sax.Tag | sax.QualifiedTag): void {
		const { item } = this;
		if (!item) {
			throw Error('Unexpected function call. item is undefined.');
		}
		const { torrent } = item;
		if (torrent) {
			this.tag = tag.name;
		} else if (!tag.isSelfClosing && tag.name === TagName.Torrent) {
			item.torrent = {
				link: '',
				contentLength: 0,
				pubDate: new Date(),
			};
		} else if (tag.name === TagName.Enclosure) {
			const {
				type,
				length,
				url,
			} = tag.attributes;
			if (typeof type !== 'string' || typeof length !== 'string' || typeof url !== 'string') {
				return;
			}
			item.enclosure = {
				type,
				length: Number.parseInt(length, 10),
				url,
			};
		} else {
			this.tag = tag.name;
		}
	}
}

export default RssReader;
