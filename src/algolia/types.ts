import type { OrTags } from "./helpers.ts";

export type AlgoliaResponse = {
  exhastive: { nbHits: boolean; typo: boolean };
  exhaustiveNbHits: boolean;
  exhaustiveTypo: boolean;
  hits: Array<Story | Comment | Poll | PollOption | Hit | Job>;
  hitsPerPage: number;
  nbHits: number;
  nbPages: number;
  page: number;
  params: string;
  processingTimeMS: number;
  query: string;
  serverTimeMS: number;
};

// Tag types for better type safety and pattern support
export type StoryTag = `story`;
export type CommentTag = `comment`;
export type AuthorIDTag = `author_${string}`;
export type StoryIDTag = `story_${string}`;
export type PollTag = `poll`;
export type PollOptionTag = `pollopt`;
export type ShowHackerNewsTag = `show_hn`;
export type AskHackerNewsTag = `ask_hn`;
export type FrontPageTag = `front_page`;
export type JobTag = `job`;

export type NumericOperator = "<" | "<=" | "=" | ">" | ">=";
export type NumericFilterCreatedAt = `created_at_i${NumericOperator}${number}`;
export type NumericFilterPoints = `points${NumericOperator}${number}`;
export type NumericFilterNumComments = `num_comments${NumericOperator}${number}`;
export type NumericFilter = NumericFilterCreatedAt | NumericFilterPoints | NumericFilterNumComments;

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

export type HighlightResult = { matchLevel: string; matchedWords: string[]; value: string; fullyHighlighted?: boolean };

export type TagArrayWithComment = [string, ...string[]] & { includes: (s: CommentTag) => true };
export type TagArrayWithStory = [string, ...string[]] & { includes: (s: StoryTag) => true };
export type TagArrayWithPoll = [string, ...string[]] & { includes: (s: PollTag) => true };
export type TagArrayWithPollOption = [string, ...string[]] & { includes: (s: PollOptionTag) => true };
export type TagArrayWithJob = [string, ...string[]] & { includes: (s: JobTag) => true };

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
