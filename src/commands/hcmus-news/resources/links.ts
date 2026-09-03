import type { NewsCategory, NewsSource } from '../types/types.ts';

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36';

export const NEWS_SOURCES: readonly NewsSource[] = [
  {
    url: 'https://www.fit.hcmus.edu.vn/vn/feed.aspx',
    name: 'Khoa Công nghệ Thông tin - FIT@HCMUS',
    category: 'fithcmus',
    type: 'rss',
  },
  {
    url: 'http://ktdbcl.hcmus.edu.vn/index.php/cong-tac-kh-o-thi/l-ch-thi-h-c-ky?format=feed&type=rss',
    name: 'Lịch thi HCMUS - PKTĐBCL',
    category: 'lichthi',
    type: 'rss',
  },
  {
    url: 'http://ktdbcl.hcmus.edu.vn/index.php/thong-bao?format=feed&type=rss',
    name: 'Thông báo Phòng khảo thí - PKTĐBCL',
    category: 'thongbao',
    type: 'rss',
  },
  {
    url: 'https://hcmus.edu.vn/wp-json/wp/v2/posts?categories=3&per_page=10&_fields=title,link',
    name: 'Thông tin dành cho sinh viên - HCMUS',
    category: 'hcmus',
    type: 'json',
  },
  {
    url: 'https://www.ctda.hcmus.edu.vn/wp-json/wp/v2/posts?per_page=10&_fields=title,link',
    name: 'Chương trình đề án CNTT - CLC/APCS',
    category: 'ctda',
    type: 'json',
  },
  {
    url: 'https://hcmus.edu.vn/wp-json/wp/v2/posts?categories=1&per_page=10&_fields=title,link',
    name: 'Tin tức chung - HCMUS',
    category: 'tintuc',
    type: 'json',
  },
] as const;

export const CATEGORY_NAMES: Record<NewsCategory, string> = {
  fithcmus: 'Khoa Công nghệ Thông tin - FIT@HCMUS',
  lichthi: 'Lịch thi HCMUS - PKTĐBCL',
  thongbao: 'Thông báo Phòng khảo thí - PKTĐBCL',
  hcmus: 'Thông tin dành cho sinh viên - HCMUS',
  ctda: 'Chương trình đề án CNTT - CLC/APCS',
  tintuc: 'Tin tức chung - HCMUS',
};
