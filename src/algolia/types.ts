import type { OrTags } from "./helpers.ts";

/**
 * Tag used to search for stories.
 * @example "story"
 */
export type StoryTag = `story`;

/**
 * Tag used to search for comments.
 * @example "comment"
 */
export type CommentTag = `comment`;

/**
 * Tag used to search for content by a specific author.
 * @example "author_pg" for posts by user "pg"
 */
export type AuthorIDTag = `author_${string}`;

/**
 * Tag used to search for comments within a specific story.
 * @example "story_12345" for comments in story ID 12345
 */
export type StoryIDTag = `story_${string}`;

/**
 * Tag used to search for polls.
 * @example "poll"
 */
export type PollTag = `poll`;

/**
 * Tag used to search for poll options.
 * @example "pollopt"
 */
export type PollOptionTag = `pollopt`;

/**
 * Tag used to search for "Show HN" posts.
 * @example "show_hn"
 */
export type ShowHackerNewsTag = `show_hn`;

/**
 * Tag used to search for "Ask HN" posts.
 * @example "ask_hn"
 */
export type AskHackerNewsTag = `ask_hn`;

/**
 * Tag used to search for front page stories.
 * @example "front_page"
 */
export type FrontPageTag = `front_page`;

/**
 * Tag used to search for job postings.
 * @example "job"
 */
export type JobTag = `job`;

/**
 * Numeric operators used to filter numeric fields in search queries.
 * @example "<", "<=", "=", ">", ">="
 */
export type NumericOperator = "<" | "<=" | "=" | ">" | ">=";

/**
 * Numeric filter for filtering content by creation date (Unix timestamp).
 * @example "created_at_i>=1640995200" for content created after Jan 1, 2022
 */
export type NumericFilterCreatedAt = `created_at_i${NumericOperator}${number}`;

/**
 * Numeric filter for filtering content by points/score.
 * @example "points>=100" for content with 100+ points
 */
export type NumericFilterPoints = `points${NumericOperator}${number}`;

/**
 * Numeric filter for filtering content by number of comments.
 * @example "num_comments>=10" for content with 10+ comments
 */
export type NumericFilterNumComments = `num_comments${NumericOperator}${number}`;

/**
 * Union type for all supported numeric filters.
 * Allows filtering by creation date, points, or comment count.
 */
export type NumericFilter = NumericFilterCreatedAt | NumericFilterPoints | NumericFilterNumComments;

/**
 * Union type of all supported search tags.
 * Used to filter search results by content type, author, or story.
 * @example "story", "comment", "author_pg", "story_12345", "show_hn"
 */
export type Tag =
  | StoryTag
  | CommentTag
  | AuthorIDTag
  | StoryIDTag
  | PollTag
  | PollOptionTag
  | ShowHackerNewsTag
  | AskHackerNewsTag
  | FrontPageTag
  | JobTag;

/**
 * Parameters for searching Hacker News content via the Algolia API.
 * Provides comprehensive control over search queries, filtering, and pagination.
 */
export type SearchParams = {
  /**
   * The text query to search for in content.
   * Searches across titles, URLs, and text content.
   * @example "machine learning", "startup funding"
   */
  query?: string;

  /**
   * Array of tags to filter search results.
   * Can include content type tags, author tags, or story-specific tags.
   * @example ["story"], ["author_pg"], ["show_hn"]
   */
  tags?: Array<Tag | OrTags>;

  /**
   * Array of numeric filters to apply to search results.
   * Allows filtering by creation date, points, or comment count.
   * @example ["points>=100", "created_at_i>=1640995200"]
   */
  numericFilters?: NumericFilter[];

  /**
   * The page number for pagination (0-based).
   * @default 0
   * @example 0 for first page, 1 for second page
   */
  page?: number;

  /**
   * Number of results to return per page.
   * Must be between 1 and 100.
   * @default 100
   * @example 20, 50, 100
   */
  hitsPerPage?: number;

  /**
   * Whether to sort results by creation date (newest first).
   * When false, results are sorted by relevance.
   * @default true
   */
  sortByDate?: boolean;

  /**
   * Array of optional words that should be present in results.
   * These words boost relevance but are not required.
   * @example ["typescript", "react"]
   */
  optionalWords?: string[];

  /**
   * Custom filter string for advanced filtering.
   * Uses Algolia's filter syntax.
   * @example "points > 50 AND num_comments > 5"
   */
  filters?: string;

  /**
   * Array of attributes to restrict the search to.
   * Limits which fields are searched for the query.
   * @default ["title"]
   * @example ["title", "url"], ["story_text"]
   */
  restrictSearchableAttributes?: string[];
};

/**
 * Highlighting information for search result fields.
 * Contains information about which parts of a field matched the search query.
 */
export type HighlightResult = {
  /**
   * The level of matching: "none", "partial", or "full".
   */
  matchLevel: string;

  /**
   * Array of words that matched the search query.
   */
  matchedWords: string[];

  /**
   * The highlighted value with HTML tags around matched text.
   */
  value: string;

  /**
   * Whether the entire field was highlighted.
   */
  fullyHighlighted?: boolean;
};

/**
 * Type-safe tag array that is guaranteed to contain a comment tag.
 * Used internally to ensure type safety for comment objects.
 */
export type TagArrayWithComment = [string, ...string[]] & { includes: (s: CommentTag) => true };

/**
 * Type-safe tag array that is guaranteed to contain a story tag.
 * Used internally to ensure type safety for story objects.
 */
export type TagArrayWithStory = [string, ...string[]] & { includes: (s: StoryTag) => true };

/**
 * Type-safe tag array that is guaranteed to contain a poll tag.
 * Used internally to ensure type safety for poll objects.
 */
export type TagArrayWithPoll = [string, ...string[]] & { includes: (s: PollTag) => true };

/**
 * Type-safe tag array that is guaranteed to contain a poll option tag.
 * Used internally to ensure type safety for poll option objects.
 */
export type TagArrayWithPollOption = [string, ...string[]] & { includes: (s: PollOptionTag) => true };

/**
 * Type-safe tag array that is guaranteed to contain a job tag.
 * Used internally to ensure type safety for job objects.
 */
export type TagArrayWithJob = [string, ...string[]] & { includes: (s: JobTag) => true };

/**
 * Base type for all objects returned by the Hacker News Algolia API.
 * Contains common fields shared by all content types (stories, comments, polls, jobs).
 */
export type Hit = {
  /**
   * Highlighting information for fields that matched the search query.
   * Keys are field names, values contain highlighting details.
   */
  _highlightResult: Record<string, HighlightResult>;

  /**
   * Array of tags that categorize this object.
   * Includes content type and other metadata tags.
   * @example ["story", "front_page"], ["comment", "author_pg"]
   */
  _tags: string[];

  /**
   * The username of the author who created this content.
   * @example "pg", "dang", "sama"
   */
  author: string;

  /**
   * The creation date in ISO 8601 format.
   * @example "2023-01-15T10:30:00.000Z"
   */
  created_at: string;

  /**
   * The creation date as a Unix timestamp.
   * @example 1673782200
   */
  created_at_i: number;

  /**
   * Unique identifier for this object.
   * @example "12345678"
   */
  objectID: string;

  /**
   * The last update date in ISO 8601 format.
   * @example "2023-01-15T10:30:00.000Z"
   */
  updated_at: string;
};

/**
 * Comment object returned by the Hacker News Algolia API.
 * Represents a comment posted on Hacker News.
 */
export type Comment = Hit & {
  /**
   * Type-safe tag array guaranteed to contain a comment tag.
   */
  _tags: TagArrayWithComment;

  /**
   * Array of child comment IDs (replies to this comment).
   * @example [12345679, 12345680]
   */
  children?: number[];

  /**
   * The ID of the parent comment (if this is a reply).
   * If this is a top-level comment, equals story_id.
   * @example 12345677
   */
  parent_id?: number;

  /**
   * The points/score of this comment.
   * Can be null for comments that haven't been voted on.
   * @example 15, null
   */
  points: number | null;

  /**
   * The ID of the story this comment belongs to.
   * @example 12345678
   */
  story_id: number;

  /**
   * The title of the story this comment is posted in.
   * @example "Show HN: My new startup"
   */
  story_title: string;

  /**
   * The text content of the comment.
   * @example "This is a comment"
   */
  comment_text?: string;
};

/**
 * Story object returned by the Hacker News Algolia API.
 * Represents a story/link posted on Hacker News.
 */
export type Story = Hit & {
  /**
   * Type-safe tag array guaranteed to contain a story tag.
   */
  _tags: TagArrayWithStory;

  /**
   * Array of child comment IDs (all comments in this story).
   * @example [12345679, 12345680, 12345681]
   */
  children: number[];

  /**
   * The number of comments in this story.
   * @example 42
   */
  num_comments?: number;

  /**
   * The points/score of this story.
   * Can be null for stories that haven't been voted on.
   * @example 156, null
   */
  points: number | null;

  /**
   * The ID of this story.
   * @example 12345678
   */
  story_id: number;

  /**
   * The text content of the story (for self-posts).
   * Only present for Ask HN, Show HN, or other text-based posts.
   * @example "What are your thoughts on...?"
   */
  story_text?: string;

  /**
   * The title of the story.
   * @example "Show HN: My new startup"
   */
  title: string;

  /**
   * The external URL of the story (if it's a link post).
   * Not present for self-posts or Ask HN posts.
   * @example "https://example.com/article"
   */
  url?: string;
};

/**
 * Poll object returned by the Hacker News Algolia API.
 * Represents a poll posted on Hacker News.
 */
export type Poll = Hit & {
  /**
   * Type-safe tag array guaranteed to contain a poll tag.
   */
  _tags: TagArrayWithPoll;

  /**
   * Array of child comment IDs (all comments in this poll).
   * @example [12345679, 12345680]
   */
  children: number[];

  /**
   * The number of comments in this poll.
   * @example 25
   */
  num_comments: number;

  /**
   * Array of poll option IDs (the choices in this poll).
   * @example [12345681, 12345682, 12345683]
   */
  parts: number[];

  /**
   * The points/score of this poll.
   * Can be null for polls that haven't been voted on.
   * @example 89, null
   */
  points: number | null;

  /**
   * The title/question of the poll.
   * @example "What's your favorite programming language?"
   */
  title: string;
};

/**
 * Poll option object returned by the Hacker News Algolia API.
 * Represents a choice/option in a poll.
 */
export type PollOption = Hit & {
  /**
   * Type-safe tag array guaranteed to contain a poll option tag.
   */
  _tags: TagArrayWithPollOption;

  /**
   * The number of votes this poll option received.
   * @example 42
   */
  points: number;
};

/**
 * Job object returned by the Hacker News Algolia API.
 * Represents a job posting on Hacker News.
 * Jobs can either have an external URL or contain job text directly.
 */
export type Job =
  & Hit
  & {
    /**
     * Type-safe tag array guaranteed to contain a job tag.
     */
    _tags: TagArrayWithJob;

    /**
     * The title of the job posting.
     * @example "Senior Software Engineer at TechCorp"
     */
    title: string;
  }
  & (
    {
      /**
       * The external URL where the job is posted.
       * Present when the job links to an external job board.
       * @example "https://company.com/careers/engineer"
       */
      url: string;
    } | {
      /**
       * The job description text.
       * Present when the job description is posted directly on HN.
       * @example "We are looking for a senior engineer..."
       */
      job_text: string;
    }
  );
