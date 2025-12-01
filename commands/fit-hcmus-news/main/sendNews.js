import { schema, SentNews } from "../db/newSchema.js";
import { getListNews } from "./getListNews.js";

export async function sendNews(client) {
    setInterval(async () => {
        try {
            const listNewsFromPages = await getListNews(); // get list news from all feeds
            if (!Array.isArray(listNewsFromPages) || listNewsFromPages.length === 0) return;

            const categories = [...new Set(listNewsFromPages.map(n => n.category))];

            // get list news sent to channel from db
            // format: { category: [url1, url2, ...], category: [url1, url2, ...], ... }
            const getSentNewsFromDB = await SentNews.find({ category: { $in: categories } }).lean();

            const sentUrlsMap = {}; // this is a map of categories and their sent urls
            const MAX_URLS = 10;

            getSentNewsFromDB.forEach(record => {
                const urls = new Set(record.arrSentUrls || []);
                if (record.url) {
                    urls.add(record.url);
                }
                sentUrlsMap[record.category] = Array.from(urls);
            });

            // array filter new news -> newNews array is only contain new news
            const newNews = [];

            // loop through list news from pages
            for (const news of listNewsFromPages) {
                if (!sentUrlsMap[news.category]) {
                    sentUrlsMap[news.category] = [];
                }

                // if url is not in the set, it is a new news
                if (!sentUrlsMap[news.category].includes(news.url)) {
                    newNews.push(news);

                    // add newest news to the end of list
                    sentUrlsMap[news.category] = [...sentUrlsMap[news.category], news.url];

                    // if (sentUrlsMap[news.category].length > MAX_URLS) { // 10
                    //     sentUrlsMap[news.category] = sentUrlsMap[news.category].slice(-MAX_URLS);
                    // }
                }
            }

            if (newNews.length === 0) return; // if no new news, return

            // send news to users
            const configs = await schema.find({ isActive: true }).lean(); // get config of servers
            if (!configs.length) return;

            for (const cfg of configs) {
                const guild = client.guilds.cache.get(cfg.guildId);
                if (!guild) continue;

                const channel = guild.channels.cache.get(cfg.channelId);
                if (!channel) continue;

                const userNews = newNews.filter(n =>
                    !cfg.categories?.length || cfg.categories.includes(n.category)
                );

                for (const news of userNews) {
                    try {

                        // send news to channel
                        await channel.send(
                            `📰 | **${news.title}**\n\n${news.url}`
                        );

                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (err) {
                        console.error(`Failed to send to guild ${cfg.guildId}:`, err);
                    }
                }
            }

            // update db after sending news
            const categoriesToUpdate = [...new Set(newNews.map(n => n.category))];

            for (const cate of categoriesToUpdate) {
                const updatedUrls = sentUrlsMap[cate].slice(-MAX_URLS);
                const latestUrl = updatedUrls[updatedUrls.length - 1];
                const latestNews = newNews.find(n => n.category === cate && n.url === latestUrl);

                // update db
                await SentNews.findOneAndUpdate(
                    { category: cate },
                    {
                        title: latestNews?.title ?? "",
                        url: latestUrl,
                        arrSentUrls: updatedUrls,
                        sentAt: new Date()
                    },
                    { upsert: true, new: true }
                );
            }

        } catch (error) {
            console.error("sendNews error:", error);
        }
    }, 1000 * 60 * 10);
}