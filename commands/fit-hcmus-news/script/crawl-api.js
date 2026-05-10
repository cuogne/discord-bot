export async function crawlApiNews(link, category) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const data = await fetch(link, { signal: controller.signal })
    const news = await data.json()

    /*
    [
      {
        link: 'https://www.ctda.hcmus.edu.vn/vi/2026/04/ctda-lich-thi-chi-tiet-cuoi-ky-hk2-2526/',
        title: { rendered: '[CTĐA] Lịch thi chi tiết cuối kỳ HK2/2526' }
      },
    ]
    */

    const newsList = [];

    for (let i = 0; i < news.length; i++) {
      const title = news[i].title.rendered
      const link = news[i].link

      if (!title || !link) {
        continue;
      }

      newsList.push({
        category,
        title,
        url: link,
      })
    }

    return newsList
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}