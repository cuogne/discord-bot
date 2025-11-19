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

        const items = channel.item.slice(0, 10);
        const newsList = [];

        for (const item of items) {
            if (!item || !item.title || !Array.isArray(item.title) || item.title.length === 0) {
                continue;
            }
            if (!item.link || !Array.isArray(item.link) || item.link.length === 0) {
                continue;
            }

            const title = item.title[0];
            const url = item.link[0];

            if (!title || !url) {
                continue;
            }

            newsList.push({
                category,
                title,
                url,
            });
        }

        if (newsList.length === 0) {
            throw new Error(`No valid news items found for ${category}`);
        }

        return newsList;
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}