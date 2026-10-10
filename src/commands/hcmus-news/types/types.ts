export type NewsCategory =
  'fithcmus' | 'lichthi' | 'thongbao' | 'hcmus' | 'ctda' | 'tintuc' | 'pctsv';

export type NewsFeedType = 'rss' | 'json' | 'pctsv';

export interface NewsSource {
  readonly url: string;
  readonly sourceLink: string;
  readonly name: string;
  readonly category: NewsCategory;
  readonly type: NewsFeedType;
}

export interface RawNewsItem {
  readonly category: NewsCategory;
  readonly title: string;
  readonly url: string;
}

export interface ProcessedNewsItem {
  readonly category: NewsCategory;
  readonly title: string;
  readonly url: string;
  readonly summary: string;
  readonly sentAt: Date;
  readonly prompt_token?: number;
  readonly completion_token?: number;
}

export interface IUserConfig {
  guildId: string;
  guildName?: string;
  channelId: string;
  channelName?: string;
  userSetup?: string;
  userId?: string;
  setupAt: Date;
  isActive: boolean;
}

export interface INewsConfig {
  category: NewsCategory;
  url: string;
  title: string;
  summary: string;
  sentAt: Date;
  prompt_token?: number;
  completion_token?: number;
}
