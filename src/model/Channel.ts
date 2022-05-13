import FeedItem from './FeedItem';
import Page from './Page';

interface Channel extends Page {
	items: FeedItem;
}

export default Channel;
