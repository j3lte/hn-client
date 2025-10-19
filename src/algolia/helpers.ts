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

// Helper functions to create specific tag types
export const createAuthorTag = (username: string): AuthorIDTag => `author_${username}`;
export const createStoryTag = (storyId: string | number): StoryIDTag => `story_${storyId}`;

// Common tag patterns
export const Tags = {
  STORY: "story" as StoryTag,
  COMMENT: "comment" as CommentTag,
  author: createAuthorTag,
  story: createStoryTag,
  POLL: "poll" as PollTag,
  POLLOPT: "pollopt" as PollOptionTag,
  SHOW_HN: "show_hn" as ShowHackerNewsTag,
  ASK_HN: "ask_hn" as AskHackerNewsTag,
  FRONT_PAGE: "front_page" as FrontPageTag,
  JOB: "job" as JobTag,
} as const;

export class OrTags {
  tags: Tag[];
  constructor(tags: Tag[]) {
    this.tags = tags;
  }
  static from(tags: Tag[]): OrTags {
    return new OrTags(tags);
  }
  toString(): string {
    return `(${this.tags.join(",")})`;
  }
}

/**
 * Builds search parameters for the Hacker News Algolia API
 * @param params - Search parameters object
 * @returns URL search parameters string
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

export const filterHighlightedFields = (highlights: Record<string, HighlightResult>) => {
  return Object.fromEntries(
    Object.entries(highlights).filter(([, result]) => result.matchLevel !== "none"),
  );
};
