import { schema, newsSchema } from "../db/newSchema.js";
import { getConfigServer } from "./getConfigServer.js";
import { filterNews } from "./filterNews.js";
import { getContentFromURL } from "./getContent.js";
import { summarizeNewsWithGemini } from "./summarizeWithGemini.js";
import { getListNews } from "./getListNews.js";
import { saveToDB } from "./saveDB.js";
import { EmbedBuilder } from "discord.js";

const MAX_URLS = 20;                // upgrade 10 -> 20
const SCAN_TIME = 1000 * 60 * 10    // scan news 10 minutes

const SKIP_SUMMARY_CATEGORIES = ['lichthi', 'thongbao'];

export async function sendNews(client) {
    const run = async () => {
        try {
            const listNewsFromPages = await getListNews(); // get list news from all feeds
            if (!Array.isArray(listNewsFromPages) || listNewsFromPages.length === 0) {
                return;
            }

            // loc tin moi
            const { newNews, sentUrlsMap } = await filterNews(listNewsFromPages, newsSchema)
            if (newNews.length === 0) {
                return;
            }

            // summarize with ai - sequential to avoid rate limit
            const SummaryResult = {} // title, url, summary
            for (const news of newNews) {
                try {
                    let summary = '';
                    if (!SKIP_SUMMARY_CATEGORIES.includes(news.category)) {
                        const content = await getContentFromURL(news.url);
                        if (!content) continue;

                        summary = await summarizeNewsWithGemini(content);
                    }

                    SummaryResult[news.url] = {
                        title: news.title,
                        url: news.url,
                        summary: summary,
                        category: news.category
                    };
                    
                    // Small delay to be safe
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    console.error(`Failed to fetch summary for ${news.url}:`, err);
                }
            }

            // get config of servers
            const configs = await getConfigServer(schema)
            if (!configs.length) {
                console.log("No active server configurations found in database.");
                return;
            }

            // for (const cfg of configs) {
            await Promise.all(configs.map(async (cfg) => {
                const guild = client.guilds.cache.get(cfg.guildId);
                if (!guild) return;

                const channel = guild.channels.cache.get(cfg.channelId);
                if (!channel) return;

                // const userNews = newNews.filter(n =>
                //     !cfg.categories?.length || cfg.categories.includes(n.category)
                // );

                for (const news of Object.values(SummaryResult)) {
                    try {
                        // send news to channel

                        // format:
                        /*
                        📰 | Đăng ký tham quan NAB Vietnam ngày 21/5

                        NAB Vietnam mở đơn đăng ký tham quan văn phòng tại The Hallmark và tham gia Workshop “Interview mastery” vào sáng 21/5/2026 dành riêng cho 50 sinh viên CNTT năm 3, 4.
                        Chương trình giúp sinh viên trải nghiệm môi trường làm việc tại Top 4 ngân hàng Úc, rèn luyện kỹ năng phỏng vấn cùng chuyên gia quốc tế và được tích lũy điểm rèn luyện hoặc môn Kiến tập.
                        Hạn chót đăng ký tại https://link.hcmus.edu.vn/Tour-NAB là 15g00 ngày 5/5/2026, lưu ý link sẽ đóng sớm khi đủ số lượng và có quy định xử lý nghiêm nếu sinh viên vắng mặt không phép.

                        🔗Chi tiết xem tại: https://www.fit.hcmus.edu.vn/vn/Default.aspx?tabid=292&newsid=17375
                        */

                        await channel.send(
                            `📰 | **${news.title}**\n\n` +
                            `${news.summary.trim() ? `${news.summary.trim()}\n\n` : ''}` +
                            `🔗 **Chi tiết xem tại: **${news.url}`
                        );

                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (err) {
                        console.error(`Failed to send to guild ${cfg.guildId}:`, err);
                    }
                }
            }));

            // save to db
            await saveToDB(newNews, SummaryResult, sentUrlsMap, MAX_URLS);

        } catch (error) {
            console.error("sendNews error:", error);
        } finally {
            setTimeout(run, SCAN_TIME);
        }
    };

    run();
}