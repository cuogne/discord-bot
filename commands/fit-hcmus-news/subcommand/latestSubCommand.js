import { feedLinks } from "../resource/link.js"
import { crawlRssNews } from "../script/crawl-rss.js";
import { crawlHTMLNews } from "../script/crawl-html.js";

export async function latestSubCommand(interaction) {
    try {
        await interaction.deferReply();

        const categoryOption = interaction.options.getString('category');

        const feed = feedLinks.find(f => f.category === categoryOption);
        const type = feed.type
        const url = feed ? feed.url : null;

        if (type == 'rss') {
            const rssNewsArr = await crawlRssNews(url, categoryOption);
            const rssNewsData = Array.isArray(rssNewsArr) ? rssNewsArr[rssNewsArr.length - 1] : rssNewsArr;
            await interaction.editReply(
                `📰 | **${rssNewsData.title}**\n\n${rssNewsData.url}`
            );
        } else if (type == 'html') {
            const htmlNewsArr = await crawlHTMLNews(url, categoryOption);
            const htmlNewsData = Array.isArray(htmlNewsArr) ? htmlNewsArr[htmlNewsArr.length - 1] : htmlNewsArr;
            await interaction.editReply(
                `📰 | **${htmlNewsData.title}**\n\n${htmlNewsData.url}`
            );
        }

    } catch (error) {
        await interaction.editReply({
            content: '❌ | Failed to fetch the latest news.',
        });
        console.error(error);
    }
}