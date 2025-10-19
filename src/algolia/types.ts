import type { OrTags } from "./helpers.ts";

/**
 * Tag used to search for stories.
 */
export type StoryTag = `story`;
/**
 * Tag used to search for comments.
 */
export type CommentTag = `comment`;
/**
 * Tag used to search for authors.
 */
export type AuthorIDTag = `author_${string}`;
/**
 * Tag used to search for stories.
 */
export type StoryIDTag = `story_${string}`;
/**
 * Tag used to search for polls.
 */
export type PollTag = `poll`;
/**
 * Tag used to search for poll options.
 */
export type PollOptionTag = `pollopt`;
/**
 * Tag used to search for Show Hacker News.
 */
export type ShowHackerNewsTag = `show_hn`;
/**
 * Tag used to search for Ask Hacker News.
 */
export type AskHackerNewsTag = `ask_hn`;
/**
 * Tag used to search for the front page.
 */
export type FrontPageTag = `front_page`;
/**
 * Tag used to search for jobs.
 */
export type JobTag = `job`;

/**
 * Numeric operator used to filter numeric fields.
 */
export type NumericOperator = "<" | "<=" | "=" | ">" | ">=";
/**
 * Numeric filter used to filter created at.
 */
export type NumericFilterCreatedAt = `created_at_i${NumericOperator}${number}`;
/**
 * Numeric filter used to filter points.
 */
export type NumericFilterPoints = `points${NumericOperator}${number}`;
/**
 * Numeric filter used to filter number of comments.
 */
export type NumericFilterNumComments = `num_comments${NumericOperator}${number}`;
/**
 * Numeric filter used to filter number of comments.
 */
export type NumericFilter = NumericFilterCreatedAt | NumericFilterPoints | NumericFilterNumComments;

/**
 * Tag used to search for stories, comments, authors, stories, polls, poll options, show Hacker News, ask Hacker News, front page, and jobs.
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
 * Search parameters used to search for stories, comments, authors, stories, polls, poll options, show Hacker News, ask Hacker News, front page, and jobs.
 */
export type SearchParams = {
  /**
   * The query to search for.
   */
  query?: string;
  /**
   * The tags to search for.
   */
  tags?: Array<Tag | OrTags>;
  /**
   * The numeric filters to apply to the search.
   */
  numericFilters?: NumericFilter[];
  /**
   * The page number to search on.
   */
  page?: number;
  /**
   * The number of hits per page to return.
   */
  hitsPerPage?: number;
  /**
   * Whether to sort the results by date.
   */
  sortByDate?: boolean;
  /**
   * Optional words
   */
  optionalWords?: string[];
  /**
   * Custom filters
   */
  filters?: string;
  /**
   * The attributes to restrict the search to.
   *
   * @example ["title", "url"]
   */
  restrictSearchableAttributes?: string[];
};

/**
 * Highlight result used to highlight the search result.
 */
export type HighlightResult = { matchLevel: string; matchedWords: string[]; value: string; fullyHighlighted?: boolean };

/**
 * Tag array with comment.
 */
export type TagArrayWithComment = [string, ...string[]] & { includes: (s: CommentTag) => true };
/**
 * Tag array with story.
 */
export type TagArrayWithStory = [string, ...string[]] & { includes: (s: StoryTag) => true };
/**
 * Tag array with poll.
 */
export type TagArrayWithPoll = [string, ...string[]] & { includes: (s: PollTag) => true };
/**
 * Tag array with poll option.
 */
export type TagArrayWithPollOption = [string, ...string[]] & { includes: (s: PollOptionTag) => true };
/**
 * Tag array with job.
 */
export type TagArrayWithJob = [string, ...string[]] & { includes: (s: JobTag) => true };

/**
 * This is a base type for all objects returned by the Algolia API.
 */
export type Hit = {
  /**
   * The highlighted fields in the search result.
   */
  _highlightResult: Record<string, HighlightResult>;
  /**
   * The tags included in this object
   */
  _tags: string[];
  /**
   * The author of this object.
   */
  author: string;
  /**
   * The creation date of this object (ISO 8601 format).
   */
  created_at: string;
  /**
   * The creation date of this object as a Unix timestamp.
   */
  created_at_i: number;
  /**
   * The object ID of this object.
   */
  objectID: string;
  /**
   * The last update date of this object (ISO 8601 format).
   */
  updated_at: string;
};

/**
 * Comment object returned by the Algolia API.
 */
export type Comment = Hit & {
  /**
   * The tags included in this comment
   */
  _tags: TagArrayWithComment;
  /**
   * The child comments of this comment.
   */
  children?: number[];
  /**
   * The parent comment of this comment.
   */
  parent_id?: number;
  /**
   * The points of this comment.
   */
  points: number | null;
  /**
   * The story ID of this comment.
   */
  story_id: number;
  /**
   * The title of the story this comment is in.
   */
  story_title: string;
};

/**
 * Story object returned by the Algolia API.
 */
export type Story = Hit & {
  /**
   * The tags included in this story
   */
  _tags: TagArrayWithStory;
  /**
   * The child objects of this story.
   */
  children: number[];
  /**
   * The number of comments in this story.
   */
  num_comments?: number;
  /**
   * The points of this story.
   */
  points: number | null;
  /**
   * The story ID of this story.
   */
  story_id: number;
  /**
   * The text of this story.
   */
  story_text?: string;
  /**
   * The title of this story.
   */
  title: string;
  /**
   * The URL of this story.
   */
  url?: string;
};

/**
 * Poll object returned by the Algolia API.
 */
export type Poll = Hit & {
  /**
   * The tags included in this poll
   */
  _tags: TagArrayWithPoll;
  /**
   * The child objects of this poll.
   */
  children: number[];
  /**
   * The number of comments in this poll.
   */
  num_comments: number;
  /**
   * The parts of this poll.
   */
  parts: number[];
  /**
   * The points of this poll.
   */
  points: number | null;
  /**
   * The title of this poll.
   */
  title: string;
};

/**
 * Poll option object returned by the Algolia API.
 */
export type PollOption = Hit & {
  /**
   * The tags included in this poll option
   */
  _tags: TagArrayWithPollOption;
  /**
   * The points of this poll option.
   */
  points: number;
};

/**
 * Job object returned by the Algolia API.
 */
export type Job =
  & Hit
  & {
    /**
     * The tags included in this job
     */
    _tags: TagArrayWithJob;
    /**
     * The title of this job.
     */
    title: string;
  }
  & (
    {
      /**
       * The URL of this job.
       */
      url: string;
    } | {
      /**
       * The text of this job.
       */
      job_text: string;
    }
  );
