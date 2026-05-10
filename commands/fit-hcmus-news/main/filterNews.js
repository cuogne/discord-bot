export async function filterNews(listNewsFromPages, newsSchema) {
  const categories = [...new Set(listNewsFromPages.map(n => n.category))];

  const listNewsFromDB = await newsSchema.find({ category: { $in: categories } }).lean();

  const sentUrlsMap = {}; // this is a map of categories and their sent urls

  listNewsFromDB.forEach(record => {
    const urls = new Set(record.listNewsUrl || []);
    if (record.url) {
      urls.add(record.url);
    }
    sentUrlsMap[record.category] = Array.from(urls);
  });

  const newNews = [];

  for (const news of listNewsFromPages) {
    if (!sentUrlsMap[news.category]) {
      sentUrlsMap[news.category] = [];
    }

    if (!sentUrlsMap[news.category].includes(news.url)) {
      newNews.push(news);
      sentUrlsMap[news.category].push(news.url);
      console.log("New news:", news.title);
    }
  }

  return { newNews, sentUrlsMap };
}