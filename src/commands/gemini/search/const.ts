// api endpoints of Tavily
export const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

// maximum number of search results to return from Tavily
export const TAVILY_MAX_RESULTS = 5;

// minimum score threshold for Tavily search results to be considered relevant
// if a result has a score below this threshold, it will be filtered out
export const TAVILY_MIN_SCORE = 0.4;

// maximum number of characters to include from each Tavily search result's content
// this is to prevent sending too much data to the Gemini model, which may cause
// it to exceed its input token limit
export const TAVILY_MAX_CHARS_PER_RESULT = 1000;
