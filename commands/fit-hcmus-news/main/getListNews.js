import { feedLinks } from "../resource/link.js";
import { crawlRssNews } from "../script/crawl-rss.js"
import { crawlHTMLNews } from "../script/crawl-html.js"

export async function getListNews() {
    try {
        const promises = feedLinks.map(feed => {
            if (feed.type === 'rss') {
                return crawlRssNews(feed.url, feed.category);
            } else if (feed.type === 'html') {
                return crawlHTMLNews(feed.url, feed.category);
            } else {
                return Promise.resolve(null);
            }
        });

        // using Promise.allSettled to get all results, even if some feeds are rejected
        const results = await Promise.allSettled(promises);

        const newsList = results
            .map((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    return result.value;
                } else if (result.status === 'rejected') {
                    const feed = feedLinks[index];
                    console.error(`Error fetching news from ${feed.name} (${feed.category}):`, result.reason?.message || result.reason);
                    return null;
                }
                return null;
            })
            .filter(news => news !== null)

        return newsList;

    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}