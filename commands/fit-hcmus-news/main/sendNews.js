import { schema, SentNews } from "../db/newSchema.js";
import { getListNews } from "./getListNews.js";

export async function sendNews(client) {
    setInterval(async () => {
        try {
            const listNews = await getListNews(); // [{ category, title, url }, ...]
            // const listNews = [
            //     {
            //         "category": "fithcmus",
            //         "title": "Thông báo về việc đăng ký đề tài tốt nghiệp dành cho học viên cao học khoá 34/2024 - đợt 2",
            //         "url": "https://www.fit.hcmus.edu.vn/vn/Default.aspx?tabid=292&newsid=17015"
            //     },
            //     {
            //         "category": "lichthi",
            //         "title": "Lịch thi HK1/25-26 hệ ĐTTX",
            //         "url": "http://ktdbcl.hcmus.edu.vn/index.php/cong-tac-kh-o-thi/l-ch-thi-h-c-ky/909-l-ch-thi-hk1-25-26-h-dttx"
            //     },
            //     {
            //         "category": "thongbao",
            //         "title": "Thông báo khảo sát sự hài lòng VC-NLĐ về các hoạt động hỗ trợ của trường năm 2025",
            //         "url": "http://ktdbcl.hcmus.edu.vn/index.php/thong-bao/910-thong-bao-kh-o-sat-s-hai-long-vc-nld-v-cac-ho-t-d-ng-h-tr-c-a-tru-ng-nam-2025"
            //     },
            //     {
            //         "category": "hcmus",
            //         "title": "Thông báo tổ chức Chuyên đề “Nhận diện thủ đoạn lừa đảo công nghệ cao – bảo vệ bản thân trên không gian mạng”",
            //         "url": "https://hcmus.edu.vn/thong-bao-to-chuc-chuyen-de-nhan-dien-thu-doan-lua-dao-cong-nghe-cao-bao-ve-ban-than-tren-khong-gian-mang/"
            //     }
            // ]

            if (!Array.isArray(listNews) || listNews.length === 0) return;

            // load config user
            const configs = await schema.find({ isActive: true }).lean();
            if (!configs.length) return;

            // group news by category
            const newsByCategory = {};
            for (const news of listNews) {
                if (!newsByCategory[news.category]) {
                    newsByCategory[news.category] = [];
                }
                newsByCategory[news.category].push(news);
            }

            const categories = Object.keys(newsByCategory); // get category ['fithcmus', 'lichthi', 'thongbao', 'hcmus']
            const sentNewsRecords = await SentNews.find({ category: { $in: categories } }).lean();

            // group sent news by category
            const arrSentUrlsMap = {};
            for (const record of sentNewsRecords) {
                arrSentUrlsMap[record.category] = new Set(
                    record.arrSentUrls && record.arrSentUrls.length > 0 ? record.arrSentUrls : (record.url ? [record.url] : [])
                );
            }

            // send news to each config server of user
            for (const cfg of configs) {
                const guild = client.guilds.cache.get(cfg.guildId);         // get guild by guildId
                const channel = guild?.channels.cache.get(cfg.channelId);   // get channel by channelId
                if (!channel) continue;

                // filter news by category of config
                const filteredNews = cfg.categories?.length ? listNews.filter((n) => cfg.categories.includes(n.category)) : listNews;

                const configArrSentUrlsMap = {};
                for (const category in arrSentUrlsMap) {
                    // copy set
                    configArrSentUrlsMap[category] = new Set(arrSentUrlsMap[category]);
                }

                const newNews = filteredNews.filter(news => {
                    const arrSentUrls = configArrSentUrlsMap[news.category];
                    if (!arrSentUrls) {
                        configArrSentUrlsMap[news.category] = new Set();
                        return true; // old news (exist in db -> not send)
                    }
                    return !arrSentUrls.has(news.url); // new news (not exist in db -> send)
                });

                for (const news of newNews) {
                    try {
                        await channel.send(
                            `📰 | **${news.title}**\n\n${news.url}`
                        );

                        const arrSentUrls = configArrSentUrlsMap[news.category] || new Set();
                        arrSentUrls.add(news.url);
                        configArrSentUrlsMap[news.category] = arrSentUrls;

                        if (!arrSentUrlsMap[news.category]) {
                            arrSentUrlsMap[news.category] = new Set();
                        }
                        arrSentUrlsMap[news.category].add(news.url);

                        // update db
                        await SentNews.findOneAndUpdate(
                            { category: news.category },
                            {
                                title: news.title,
                                url: news.url,
                                arrSentUrls: Array.from(arrSentUrlsMap[news.category]),
                                sentAt: new Date()
                            },
                            { upsert: true, new: true }
                        );

                    } catch (err) {
                        console.error("Error sending or saving news:", err);
                    }
                }
            }
        } catch (error) {
            console.error("sendNews error:", error);
        }
    }, 1000 * 60 * 10); // 10 phút/lần
}