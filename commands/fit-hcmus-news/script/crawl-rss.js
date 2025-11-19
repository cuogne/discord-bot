import { parseStringPromise } from 'xml2js';

export async function crawlRssNews(link, category) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // timeout 15s

    try {
        const response = await fetch(link, { signal: controller.signal });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        const result = await parseStringPromise(text);

        if (!result || !result.rss || !result.rss.channel || !Array.isArray(result.rss.channel) || result.rss.channel.length === 0) {
            throw new Error(`Invalid RSS structure: missing or empty channel for ${category}`);
        }

        const channel = result.rss.channel[0];
        if (!channel.item || !Array.isArray(channel.item) || channel.item.length === 0) {
            throw new Error(`Invalid RSS structure: missing or empty items for ${category}`);
        }

        const latestItem = channel.item[0];
        if (!latestItem || !latestItem.title || !Array.isArray(latestItem.title) || latestItem.title.length === 0) {
            throw new Error(`Invalid RSS structure: missing title for ${category}`);
        }
        if (!latestItem.link || !Array.isArray(latestItem.link) || latestItem.link.length === 0) {
            throw new Error(`Invalid RSS structure: missing link for ${category}`);
        }

        const title = latestItem.title[0];
        const url = latestItem.link[0];

        if (!title || !url) {
            throw new Error(`Invalid RSS data: empty title or url for ${category}`);
        }

        const newsData = {
            category,
            title,
            url,
        };

        return newsData;
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}