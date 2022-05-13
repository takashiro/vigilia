import Page from './Page';

export interface Resource {
	link: string;
	contentLength: number;
	pubDate: Date;
}

export interface Enclosure {
	type: string;
	length: number;
	url: string;
}

export interface FeedItem extends Page {
	torrent?: Resource;
	enclosure?: Enclosure;
}

export default FeedItem;
