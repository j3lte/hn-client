import { OrTags, Tags } from "./algolia/helpers.ts";
import { HNSearchClient, type HNSearchClientOptions, type HNSearchClientSearchResponse } from "./algolia/mod.ts";
import type { CommentObject, JobObject, PollObject, StoryObject } from "./algolia/objects.ts";
import type { NumericFilter, SearchParams, Tag } from "./algolia/types.ts";
import { HNAPI } from "./hn-api/mod.ts";

export * from "./algolia/types.ts";
export { OrTags, Tags } from "./algolia/helpers.ts";
export * from "./algolia/objects.ts";
export { HNSearchClient, type HNSearchClientOptions, type HNSearchClientSearchResponse } from "./algolia/mod.ts";

import { VERSION } from "./util/index.ts";

/**
 * Main client class for interacting with the Hacker News API via Algolia Search.
 * Provides convenient methods for common Hacker News queries and full-text search.
 *
 * @example
 * ```ts
 * import { HackerNewsClient } from "@j3lte/hn-client";
import { JobObject } from './algolia/objects';
 *
 * const client = new HackerNewsClient();
 *
 * // Get front page stories
 * const { data } = await client.frontPage();
 *
 * // Search for specific content
 * const { data: results } = await client.search({
 *   query: "machine learning",
 *   tags: ["story"]
 * });
 *
 * // Get user submissions
 * const { data: userPosts } = await client.userSubmitted("pg");
 * ```
 */
export class HackerNewsClient {
  /**
   * The version of the hn-client library.
   */
  public readonly version: string = VERSION;

  /**
   * Internal search client instance.
   * @private
   */
  private readonly searchClient: HNSearchClient;
  /**
   * Internal Hacker News API client instance.
   * @private
   */
  private readonly hnApiClient: HNAPI;

  /**
   * Creates a new HackerNewsClient instance.
   * @param options - Configuration options for the search client
   * @param options.debug - Enable debug logging for API requests
   * @param options.objDebug - Enable debug logging for object creation
   * @param options.baseUrl - Custom base URL for the API (defaults to Algolia)
   *
   * @example
   * ```ts
   * // Basic usage
   * const client = new HackerNewsClient();
   *
   * // With debug enabled
   * const debugClient = new HackerNewsClient({ debug: true });
   *
   * // With custom API endpoint
   * const customClient = new HackerNewsClient({
   *   baseUrl: "https://custom-hn-api.com"
   * });
   * ```
   */
  constructor(options: HNSearchClientOptions = {}) {
    this.searchClient = new HNSearchClient(options);
    this.hnApiClient = new HNAPI();
  }

  /**
   * Performs a custom search with full control over search parameters.
   *
   * @param params - Search parameters object
   * @param params.query - Text to search for
   * @param params.tags - Array of tags to filter by
   * @param params.numericFilters - Array of numeric filters
   * @param params.page - Page number for pagination
   * @param params.hitsPerPage - Number of results per page (1-100)
   * @param params.sortByDate - Whether to sort by date (default: true)
   * @param params.optionalWords - Optional words to boost relevance
   * @param params.filters - Custom filter string
   * @param params.restrictSearchableAttributes - Fields to search in
   * @param init - Additional fetch options
   * @returns Promise resolving to search results
   *
   * @example
   * ```ts
   * // Search for stories about AI with 100+ points
   * const { data } = await client.search({
   *   query: "artificial intelligence",
   *   tags: ["story"],
   *   numericFilters: ["points>=100"],
   *   hitsPerPage: 20
   * });
   *
   * // Search with OR logic
   * const { data } = await client.search({
   *   query: "startup",
   *   tags: [OrTags.from([Tags.STORY, Tags.COMMENT])]
   * });
   * ```
   */
  search(params: SearchParams = {}, init: RequestInit = {}): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search(params, init);
  }

  /**
   * Gets stories from the front page.
   * Automatically filters for front page stories from the last week.
   *
   * @param params - Search parameters (tags, sortByDate, and hitsPerPage are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to front page stories
   *
   * @example
   * ```ts
   * // Get front page stories
   * const { data } = await client.frontPage();
   *
   * // Get front page stories with custom query
   * const { data } = await client.frontPage({
   *   query: "javascript",
   *   page: 1
   * });
   * ```
   */
  frontPage(
    params: Omit<SearchParams, "tags" | "sortByDate" | "hitsPerPage"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<StoryObject>> {
    // Get unix timestamp for a week ago
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const numericFilters: NumericFilter[] = [
      `created_at_i>=${oneWeekAgo}`,
    ];
    return this.searchClient.search<StoryObject>({
      ...params,
      tags: [Tags.FRONT_PAGE, Tags.STORY],
      numericFilters,
    }, init);
  }

  /**
   * Gets the newest stories and polls.
   * Searches for both stories and polls sorted by creation date.
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to newest content
   *
   * @example
   * ```ts
   * // Get newest stories and polls
   * const { data } = await client.newest();
   *
   * // Get newest content with custom query
   * const { data } = await client.newest({
   *   query: "typescript",
   *   hitsPerPage: 50
   * });
   * ```
   */
  newest(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<StoryObject | PollObject>> {
    return this.searchClient.search<StoryObject | PollObject>({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.POLL])],
    }, init);
  }

  /**
   * Gets recent comments.
   * Searches for comments sorted by creation date.
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to recent comments
   *
   * @example
   * ```ts
   * // Get recent comments
   * const { data } = await client.comments();
   *
   * // Get comments with custom query
   * const { data } = await client.comments({
   *   query: "machine learning",
   *   hitsPerPage: 30
   * });
   * ```
   */
  comments(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<CommentObject>> {
    return this.searchClient.search<CommentObject>({
      ...params,
      tags: [Tags.COMMENT],
    }, init);
  }

  /**
   * Gets "Ask HN" posts.
   * Searches for posts tagged as "Ask HN" (questions to the community).
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to Ask HN posts
   *
   * @example
   * ```ts
   * // Get Ask HN posts
   * const { data } = await client.askHN();
   *
   * // Get Ask HN posts with custom query
   * const { data } = await client.askHN({
   *   query: "career advice",
   *   hitsPerPage: 25
   * });
   * ```
   */
  askHN(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.ASK_HN],
    }, init);
  }

  /**
   * Gets "Show HN" posts.
   * Searches for posts tagged as "Show HN" (projects, demos, etc.).
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to Show HN posts
   *
   * @example
   * ```ts
   * // Get Show HN posts
   * const { data } = await client.showHN();
   *
   * // Get Show HN posts with custom query
   * const { data } = await client.showHN({
   *   query: "web app",
   *   hitsPerPage: 20
   * });
   * ```
   */
  showHN(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.SHOW_HN],
    }, init);
  }

  /**
   * Gets polls.
   * Searches for posts tagged as polls.
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to polls
   *
   * @example
   * ```ts
   * // Get polls
   * const { data } = await client.polls();
   *
   * // Get polls with custom query
   * const { data } = await client.polls({
   *   query: "programming language",
   *   hitsPerPage: 15
   * });
   * ```
   */
  polls(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<PollObject>> {
    return this.searchClient.search<PollObject>({
      ...params,
      tags: [Tags.POLL],
    }, init);
  }

  /**
   * Gets job postings.
   * Searches for posts tagged as jobs.
   *
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to job postings
   *
   * @example
   * ```ts
   * // Get job postings
   * const { data } = await client.jobs();
   *
   * // Get job postings with custom query
   * const { data } = await client.jobs({
   *   query: "remote developer",
   *   hitsPerPage: 30
   * });
   * ```
   */
  jobs(
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<JobObject>> {
    return this.searchClient.search<JobObject>({
      ...params,
      tags: [Tags.JOB],
    }, init);
  }

  /**
   * Gets all content (stories, comments, polls) by a specific user.
   *
   * @param userName - The username to search for
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to all user content
   *
   * @example
   * ```ts
   * // Get all content by user "pg"
   * const { data } = await client.userAll("pg");
   *
   * // Get all content with custom query
   * const { data } = await client.userAll("dang", {
   *   query: "moderation",
   *   hitsPerPage: 50
   * });
   * ```
   */
  userAll(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<StoryObject | CommentObject | PollObject>> {
    return this.searchClient.search<StoryObject | CommentObject | PollObject>({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.COMMENT, Tags.POLL]), Tags.author(userName)],
    }, init);
  }

  /**
   * Gets comments by a specific user.
   * Searches for comments authored by the specified user.
   *
   * @param userName - The username to search for
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to user comments
   *
   * @example
   * ```ts
   * // Get comments by user "dang"
   * const { data } = await client.userThreads("dang");
   *
   * // Get comments with custom query
   * const { data } = await client.userThreads("pg", {
   *   query: "startup",
   *   hitsPerPage: 25
   * });
   * ```
   */
  userThreads(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<CommentObject>> {
    return this.searchClient.search<CommentObject>({
      ...params,
      tags: [Tags.COMMENT, Tags.author(userName)],
    }, init);
  }

  /**
   * Gets submitted content (stories and polls) by a specific user.
   * Searches for stories and polls authored by the specified user.
   *
   * @param userName - The username to search for
   * @param params - Search parameters (tags and sortByDate are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to user submissions
   *
   * @example
   * ```ts
   * // Get submissions by user "pg"
   * const { data } = await client.userSubmitted("pg");
   *
   * // Get submissions with custom query
   * const { data } = await client.userSubmitted("sama", {
   *   query: "Y Combinator",
   *   hitsPerPage: 30
   * });
   * ```
   */
  userSubmitted(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<StoryObject | PollObject>> {
    return this.searchClient.search<StoryObject | PollObject>({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.POLL]), Tags.author(userName)],
    }, init);
  }

  /**
   * Gets comments for a specific story.
   * Optionally filters comments by a specific user.
   *
   * @param storyId - The ID of the story to get comments for
   * @param params - Search parameters with optional userName filter
   * @param params.userName - Optional username to filter comments by
   * @param init - Additional fetch options
   * @returns Promise resolving to story comments
   *
   * @example
   * ```ts
   * // Get all comments for story 12345
   * const { data } = await client.commentsToStory(12345);
   *
   * // Get comments by specific user in story
   * const { data } = await client.commentsToStory(12345, {
   *   userName: "dang",
   *   hitsPerPage: 20
   * });
   * ```
   */
  commentsToStory(
    storyId: number,
    params: Omit<SearchParams, "tags" | "sortByDate"> & { userName?: string },
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<CommentObject>> {
    const { userName, ...rest } = params;
    const tags: (Tag | OrTags)[] = [Tags.COMMENT, Tags.story(storyId)];
    if (userName) {
      tags.push(Tags.author(userName));
    }
    return this.searchClient.search<CommentObject>({ ...rest, tags }, init);
  }

  /**
   * Gets the comments for the latest "Who is hiring?" story.
   *
   * @param params - Search parameters (tags, hitsPerPage and filters are automatically set)
   * @param init - Additional fetch options
   * @returns Promise resolving to comments for the "Who is hiring?" story
   */
  async whoIsHiring(
    params: Omit<SearchParams, "tags" | "sortByDate" | "filters"> = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse<CommentObject>> {
    const res = await this.searchClient.search<StoryObject>({
      tags: [Tags.STORY, Tags.author("whoishiring")],
      hitsPerPage: 1,
    });
    if (!res.data || res.data.length === 0) {
      return res as unknown as HNSearchClientSearchResponse<CommentObject>;
    }
    const story = res.data[0] as StoryObject;
    const comments = await this.searchClient.search<CommentObject>({
      ...params,
      tags: [Tags.COMMENT],
      filters: `parent_id=${story.data.story_id}`,
      hitsPerPage: 100,
    }, init);
    return comments;
  }
}
