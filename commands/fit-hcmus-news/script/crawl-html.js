import axios from 'axios';
import * as cheerio from 'cheerio';

export async function crawlHTMLNews(link, category) {
    try {
        const response = await axios.get(link);
        const html = response.data;
        const $ = cheerio.load(html);

        // class "content entry" -> article -> title links
        const elements = $('.content.entry .cmsmasters_archive_item_title.entry-title a');

        if (!elements || elements.length === 0) {
            throw new Error(`No news element found for ${category}`);
        }

        const newsList = [];
        const sizeNews = Math.min(elements.length, 10);

        for (let i = 0; i < sizeNews; i++) {
            const element = $(elements[i]);
            const title = element.text().trim();
            const url = element.attr('href');

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

        return newsList.reverse();

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}
