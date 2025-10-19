import type {
  AskHackerNewsTag,
  AuthorIDTag,
  CommentTag,
  FrontPageTag,
  HighlightResult,
  JobTag,
  PollOptionTag,
  PollTag,
  SearchParams,
  ShowHackerNewsTag,
  StoryIDTag,
  StoryTag,
  Tag,
} from "./types.ts";

/**
 * Creates an author tag for filtering content by a specific user.
 * @param username - The username to create a tag for
 * @returns An author tag string
 * @example
 * ```ts
 * createAuthorTag("pg") // returns "author_pg"
 * ```
 */
export const createAuthorTag = (username: string): AuthorIDTag => `author_${username}`;

/**
 * Creates a story tag for filtering comments within a specific story.
 * @param storyId - The story ID (as string or number)
 * @returns A story tag string
 * @example
 * ```ts
 * createStoryTag(12345) // returns "story_12345"
 * createStoryTag("12345") // returns "story_12345"
 * ```
 */
export const createStoryTag = (storyId: string | number): StoryIDTag => `story_${storyId}`;

/**
 * Collection of commonly used tag constants and helper functions.
 * Provides easy access to all supported Hacker News content tags.
 */
export const Tags = {
  /** Tag for filtering stories */
  STORY: "story" as StoryTag,
  /** Tag for filtering comments */
  COMMENT: "comment" as CommentTag,
  /** Helper function to create author tags */
  author: createAuthorTag,
  /** Helper function to create story tags */
  story: createStoryTag,
  /** Tag for filtering polls */
  POLL: "poll" as PollTag,
  /** Tag for filtering poll options */
  POLLOPT: "pollopt" as PollOptionTag,
  /** Tag for filtering Show HN posts */
  SHOW_HN: "show_hn" as ShowHackerNewsTag,
  /** Tag for filtering Ask HN posts */
  ASK_HN: "ask_hn" as AskHackerNewsTag,
  /** Tag for filtering front page stories */
  FRONT_PAGE: "front_page" as FrontPageTag,
  /** Tag for filtering job postings */
  JOB: "job" as JobTag,
} as const;

/**
 * Helper class for creating OR logic in tag filters.
 * Allows combining multiple tags with OR logic instead of AND logic.
 *
 * @example
 * ```ts
 * // Search for stories OR comments
 * const orTags = OrTags.from([Tags.STORY, Tags.COMMENT]);
 * // Results in "(story,comment)" when converted to string
 * ```
 */
export class OrTags {
  /** Array of tags to combine with OR logic */
  tags: Tag[];

  /**
   * Creates a new OrTags instance.
   * @param tags - Array of tags to combine with OR logic
   */
  constructor(tags: Tag[]) {
    this.tags = tags;
  }

  /**
   * Static factory method to create OrTags from an array.
   * @param tags - Array of tags to combine with OR logic
   * @returns New OrTags instance
   */
  static from(tags: Tag[]): OrTags {
    return new OrTags(tags);
  }

  /**
   * Converts the OrTags to a string format expected by the API.
   * @returns String in format "(tag1,tag2,tag3)"
   */
  toString(): string {
    return `(${this.tags.join(",")})`;
  }
}

/**
 * Builds URL search parameters for the Hacker News Algolia API.
 * Converts SearchParams object into a properly formatted query string.
 *
 * @param params - Search parameters object
 * @returns URL-encoded search parameters string
 *
 * @example
 * ```ts
 * const params = {
 *   query: "machine learning",
 *   tags: ["story"],
 *   hitsPerPage: 20
 * };
 * const queryString = buildSearchParams(params);
 * // Returns: "query=machine+learning&tags=story&hitsPerPage=20&restrictSearchableAttributes=title"
 * ```
 */
export const buildSearchParams = (params: SearchParams): string => {
  const searchParams = new URLSearchParams();

  // Add query parameter
  if (params.query) {
    searchParams.set("query", params.query);
  }

  // Add tags parameter (comma-separated)
  if (params.tags && params.tags.length > 0) {
    searchParams.set("tags", params.tags.join(","));
  }

  // Add numeric filters parameter (comma-separated)
  if (params.numericFilters && params.numericFilters.length > 0) {
    searchParams.set("numericFilters", params.numericFilters.join(","));
  }

  if (params.optionalWords && params.optionalWords.length > 0) {
    searchParams.set("optionalWords", params.optionalWords.join(" "));
  }

  // Add pagination parameters
  if (params.page !== undefined) {
    searchParams.set("page", params.page.toString());
  }

  if (params.filters) {
    searchParams.set("filters", params.filters);
  }

  if (params.hitsPerPage !== undefined) {
    searchParams.set("hitsPerPage", params.hitsPerPage.toString());
  }

  if (params.restrictSearchableAttributes && params.restrictSearchableAttributes.length > 0) {
    searchParams.set("restrictSearchableAttributes", params.restrictSearchableAttributes.join(","));
  } else {
    searchParams.set("restrictSearchableAttributes", "title");
  }

  return searchParams.toString();
};

/**
 * Filters highlight results to only include fields with actual matches.
 * Removes fields where matchLevel is "none" to clean up the highlight data.
 *
 * @param highlights - Record of field names to highlight results
 * @returns Filtered highlights object with only matched fields
 *
 * @example
 * ```ts
 * const highlights = {
 *   title: { matchLevel: "full", matchedWords: ["AI"], value: "<em>AI</em> News" },
 *   url: { matchLevel: "none", matchedWords: [], value: "https://example.com" }
 * };
 * const filtered = filterHighlightedFields(highlights);
 * // Returns: { title: { matchLevel: "full", matchedWords: ["AI"], value: "<em>AI</em> News" } }
 * ```
 */
export const filterHighlightedFields = (highlights: Record<string, HighlightResult>) => {
  return Object.fromEntries(
    Object.entries(highlights).filter(([, result]) => result.matchLevel !== "none"),
  );
};
