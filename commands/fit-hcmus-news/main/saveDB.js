import { newsSchema } from "../db/newSchema.js";

export async function saveToDB(newNews, SummaryResult, sentUrlsMap, MAX_URLS) {
    const categoriesToUpdate = [...new Set(newNews.map(n => n.category))];

    for (const cate of categoriesToUpdate) {
        const updatedUrls = sentUrlsMap[cate].slice(-MAX_URLS);
        const latestUrl = updatedUrls[updatedUrls.length - 1];
        
        const latestNews = SummaryResult[latestUrl];

        const updateData = {
            url: latestUrl,
            listNewsUrl: updatedUrls,
            sentAt: new Date()
        };

        if (latestNews) {
            updateData.title = latestNews.title;
            updateData.summary = latestNews.summary;
        }

        await newsSchema.findOneAndUpdate(
            { category: cate },
            updateData,
            { upsert: true, new: true }
        );
    }
}