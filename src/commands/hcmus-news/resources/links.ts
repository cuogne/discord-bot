import type { NewsCategory, NewsSource } from '../types/types.ts';

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0 Safari/537.36';

// category must be mapped with the command choices in index.ts
export const NEWS_SOURCES: readonly NewsSource[] = [
  {
    url: 'https://www.fit.hcmus.edu.vn/vn/feed.aspx',
    sourceLink: 'https://www.fit.hcmus.edu.vn/tin-tuc',
    name: 'Khoa Công nghệ Thông tin - FIT@HCMUS',
    category: 'fithcmus',
    type: 'rss',
  },
  {
    url: 'https://www.ctda.hcmus.edu.vn/wp-json/wp/v2/posts?per_page=10&_fields=title,link',
    sourceLink: 'https://www.ctda.hcmus.edu.vn/vi/thong-bao/',
    name: 'Chương trình Đề án CNTT (CLC/APCS) - CTĐA@HCMUS',
    category: 'ctda',
    type: 'json',
  },
  {
    url: 'https://hcmus.edu.vn/wp-json/wp/v2/posts?categories=3&per_page=10&_fields=title,link',
    sourceLink: 'https://hcmus.edu.vn/category/dao-tao/dai-hoc/thong-tin-danh-cho-sinh-vien',
    name: 'Thông tin dành cho Sinh viên - HCMUS',
    category: 'hcmus',
    type: 'json',
  },
  {
    url: 'https://ctsv.hcmus.edu.vn/api/news/latest?limit=10',
    sourceLink: 'https://ctsv.hcmus.edu.vn/info',
    name: 'Phòng Công tác Sinh viên - OSA@HCMUS',
    category: 'pctsv',
    type: 'pctsv',
  },
  {
    url: 'http://ktdbcl.hcmus.edu.vn/index.php/cong-tac-kh-o-thi/l-ch-thi-h-c-ky?format=feed&type=rss',
    sourceLink: 'https://ktdbcl.hcmus.edu.vn/index.php/cong-tac-kh-o-thi/l-ch-thi-h-c-ky',
    name: 'Thông báo Lịch thi - PKTĐBCL@HCMUS',
    category: 'lichthi',
    type: 'rss',
  },
  {
    url: 'http://ktdbcl.hcmus.edu.vn/index.php/thong-bao?format=feed&type=rss',
    sourceLink: 'https://ktdbcl.hcmus.edu.vn/index.php/thong-bao',
    name: 'Thông báo Phòng khảo thí - PKTĐBCL@HCMUS',
    category: 'thongbao',
    type: 'rss',
  },
  {
    url: 'https://hcmus.edu.vn/wp-json/wp/v2/posts?categories=1&per_page=10&_fields=title,link',
    sourceLink: 'https://hcmus.edu.vn/category/tin-tuc/',
    name: 'Tin tức chung - HCMUS',
    category: 'tintuc',
    type: 'json',
  },
] as const;

export const CATEGORY_NAMES: Record<NewsCategory, string> = {
  fithcmus: 'Khoa Công nghệ Thông tin - FIT@HCMUS',
  ctda: 'Chương trình Đề án CNTT (CLC/APCS) - CTĐA@HCMUS',
  hcmus: 'Thông tin dành cho Sinh viên - HCMUS',
  pctsv: 'Phòng Công tác Sinh viên - OSA@HCMUS',
  lichthi: 'Thông báo Lịch thi - PKTĐBCL@HCMUS',
  thongbao: 'Thông báo Phòng khảo thí - PKTĐBCL@HCMUS',
  tintuc: 'Tin tức chung - HCMUS',
};
