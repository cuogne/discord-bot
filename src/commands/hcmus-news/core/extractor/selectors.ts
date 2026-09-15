interface SiteSelector {
  /** Match by hostname */
  match: string;
  selectors: string[];
}

/**
 * Selector for each HCMUS website (stable structure, rarely changes).
 * Key match by hostname containing substring.
 * Add a new website: just add a block here.
 */
const SITE_SELECTORS: SiteSelector[] = [
  {
    match: 'hcmus.edu.vn',
    // prettier-ignore
    selectors: [
      '.entry-content',
      '.td-post-content',
      '.post-content',
      'article'
    ],
  },
  {
    match: 'ctda.hcmus.edu.vn',
    // prettier-ignore
    selectors: [
      '.entry-content',
      '.elementor-widget-theme-post-content',
      '.post-content',
      'article',
    ],
  },
  {
    match: 'fit.hcmus.edu.vn',
    selectors: [
      '.post-contents',
      '[id*=ViewNewsDetails_divPostDetails]',
      '[id*=divPostDetails]',
      '.news-detail',
      '.news-content',
      'article',
    ],
  },
  {
    match: 'ktdbcl.hcmus.edu.vn',
    // prettier-ignore
    selectors: [
      '.item-page',
      'div[itemprop="articleBody"]',
      '#content',
      'article'
    ],
  },
];

const GENERIC_SELECTORS = ['article', '.entry-content', '.post-content', '#content'];

export function resolveSelectors(hostname: string): string[] {
  // because hostname www.fit.hcmus.edu.vn also contains hcmus.edu.vn, we must prioritize the longest match
  const site = SITE_SELECTORS.filter((s) => hostname.includes(s.match)).sort(
    (a, b) => b.match.length - a.match.length,
  )[0];
  return site ? site.selectors : GENERIC_SELECTORS;
}
