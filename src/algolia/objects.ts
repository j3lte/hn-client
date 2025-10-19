import { unescape } from "@std/html";
import entityList from "@std/html/named-entity-list.json" with { type: "json" };
import { parseISO } from "date-fns";
import { filterHighlightedFields } from "./helpers.ts";

import type {
  Comment,
  HighlightResult,
  Hit,
  Job,
  Poll,
  PollOption,
  Story,
  TagArrayWithComment,
  TagArrayWithJob,
  TagArrayWithPoll,
  TagArrayWithPollOption,
  TagArrayWithStory,
} from "./types.ts";

const getPermaLink = (objectID: string): string => {
  return `https://news.ycombinator.com/item?id=${objectID}`;
};

const unescapeHtml = (text: string): string => {
  // Clean the text from HTML tags and remove <p></p> tags
  return unescape(text, { entityList }).replace(/<p>|<\/p>/g, "");
};

/**
 * Base class for all Hacker News objects returned by the Algolia API.
 * Provides common functionality and properties shared by all content types.
 *
 * @example
 * ```ts
 * const hit = new HitObject(rawHitData);
 * console.log(hit.type); // "hit"
 * console.log(hit.permaLink); // "https://news.ycombinator.com/item?id=12345"
 * console.log(hit.createdAt); // Date object
 * ```
 */
export class HitObject {
  /**
   * Whether debug logging is enabled for this object.
   */
  public readonly debug: boolean;

  /**
   * Highlighting information for fields that matched the search query.
   * Only includes fields with actual matches (matchLevel !== "none").
   */
  public readonly highlight: Record<string, HighlightResult>;

  /**
   * Array of tags that categorize this object.
   * @example ["story", "front_page"], ["comment", "author_pg"]
   */
  public readonly tags: string[];

  /**
   * The raw data from the API, excluding highlighting and tag information.
   */
  public data: Omit<Hit, "_highlightResult" | "_tags">;

  /**
   * Creates a new HitObject instance.
   * @param hit - Raw hit data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: Hit, debug = false) {
    this.debug = debug;
    const { _highlightResult, _tags, ...data } = hit;
    this.highlight = filterHighlightedFields(_highlightResult);
    this.tags = _tags;
    this.data = data;
  }

  /**
   * Gets the type of this object.
   * @returns The object type as a string
   */
  get type(): string {
    return "hit";
  }

  /**
   * Gets the permanent link to this item on Hacker News.
   * @returns URL to the item on news.ycombinator.com
   */
  get permaLink(): string {
    return getPermaLink(this.data.objectID);
  }

  /**
   * Gets the creation date as a Date object.
   * @returns Parsed Date object or null if creation date is invalid
   */
  get createdAt(): Date | null {
    return this.data.created_at ? parseISO(this.data.created_at) : null;
  }

  /**
   * Logs debug information about object creation.
   * Only logs when debug mode is enabled.
   * @param type - The type of object being created
   */
  reportCreateDebug(type: string): void {
    if (this.debug) {
      console.log(`[DEBUG OBJ] ${type} ${this.data.objectID}`);
    }
  }
}

/**
 * Story object class with specialized methods for story-specific functionality.
 * Extends HitObject with story-specific properties and helper methods.
 *
 * @example
 * ```ts
 * const story = new StoryObject(storyData);
 * console.log(story.title); // HTML-unescaped title
 * console.log(story.isSelfpost); // true if it's a text post
 * console.log(story.hasExternalUrl); // true if it has an external URL
 * console.log(story.url); // External URL or permalink
 * ```
 */
export class StoryObject extends HitObject {
  /**
   * Type-safe tag array guaranteed to contain a story tag.
   */
  public override readonly tags: TagArrayWithStory;

  /**
   * Story-specific data excluding highlighting and tag information.
   */
  public override readonly data: Omit<Story, "_highlightResult" | "_tags">;

  /**
   * Creates a new StoryObject instance.
   * @param hit - Raw story data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: Story, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Story");
  }

  /**
   * Checks if this story is a self-post (text-based post without external URL).
   * @returns True if the story has story_text but no external URL
   */
  get isSelfpost(): boolean {
    return !!this.data.story_text;
  }

  /**
   * Gets the HTML-unescaped title of the story.
   * @returns Cleaned title with HTML entities decoded
   */
  get title(): string {
    return unescapeHtml(this.data.title);
  }

  /**
   * Checks if this story has an external URL.
   * @returns True if the story links to an external website
   */
  get hasExternalUrl(): boolean {
    return !!this.data.url;
  }

  /**
   * Gets the URL for this story.
   * Returns the external URL if available, otherwise returns the Hacker News permalink.
   * @returns External URL or Hacker News permalink
   */
  get url(): string {
    return this.data.url ?? this.permaLink;
  }

  /**
   * Gets the type of this object.
   * @returns "story"
   */
  override get type(): string {
    return "story";
  }
}

/**
 * Comment object class with specialized methods for comment-specific functionality.
 * Extends HitObject with comment-specific properties and helper methods.
 *
 * @example
 * ```ts
 * const comment = new CommentObject(commentData);
 * console.log(comment.title); // "New comment by username in \"Story Title\""
 * console.log(comment.isRootComment); // true if it's a top-level comment
 * ```
 */
export class CommentObject extends HitObject {
  /**
   * Type-safe tag array guaranteed to contain a comment tag.
   */
  public override readonly tags: TagArrayWithComment;

  /**
   * Comment-specific data excluding highlighting and tag information.
   */
  public override readonly data: Omit<Comment, "_highlightResult" | "_tags">;

  /**
   * Creates a new CommentObject instance.
   * @param hit - Raw comment data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: Comment, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Comment");
  }

  /**
   * Gets a descriptive title for this comment.
   * @returns Formatted string like "New comment by username in \"Story Title\""
   */
  get title(): string {
    return `New comment by ${this.data.author} in "${unescapeHtml(this.data.story_title)}"`;
  }

  /**
   * Checks if this comment is a root-level comment (direct reply to story).
   * @returns True if parent_id equals story_id
   */
  get isRootComment(): boolean {
    return this.data.parent_id === this.data.story_id;
  }

  get commentText(): string {
    return unescapeHtml(this.data.comment_text ?? "");
  }

  /**
   * Gets the type of this object.
   * @returns "comment"
   */
  override get type(): string {
    return "comment";
  }
}

/**
 * Poll object class for Hacker News polls.
 * Extends HitObject with poll-specific functionality.
 *
 * @example
 * ```ts
 * const poll = new PollObject(pollData);
 * console.log(poll.type); // "poll"
 * console.log(poll.data.title); // Poll question
 * console.log(poll.data.parts); // Array of poll option IDs
 * ```
 */
export class PollObject extends HitObject {
  /**
   * Type-safe tag array guaranteed to contain a poll tag.
   */
  public override readonly tags: TagArrayWithPoll;

  /**
   * Poll-specific data excluding highlighting and tag information.
   */
  public override readonly data: Omit<Poll, "_highlightResult" | "_tags">;

  /**
   * Creates a new PollObject instance.
   * @param hit - Raw poll data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: Poll, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Poll");
  }

  /**
   * Gets the type of this object.
   * @returns "poll"
   */
  override get type(): string {
    return "poll";
  }
}

/**
 * Poll option object class for individual poll choices.
 * Extends HitObject with poll option-specific functionality.
 *
 * @example
 * ```ts
 * const pollOption = new PollOptionObject(pollOptionData);
 * console.log(pollOption.type); // "pollopt"
 * console.log(pollOption.data.points); // Number of votes
 * ```
 */
export class PollOptionObject extends HitObject {
  /**
   * Type-safe tag array guaranteed to contain a poll option tag.
   */
  public override readonly tags: TagArrayWithPollOption;

  /**
   * Poll option-specific data excluding highlighting and tag information.
   */
  public override readonly data: Omit<PollOption, "_highlightResult" | "_tags">;

  /**
   * Creates a new PollOptionObject instance.
   * @param hit - Raw poll option data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: PollOption, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Poll Option");
  }

  /**
   * Gets the type of this object.
   * @returns "pollopt"
   */
  override get type(): string {
    return "pollopt";
  }
}

/**
 * Job object class for Hacker News job postings.
 * Extends HitObject with job-specific functionality.
 *
 * @example
 * ```ts
 * const job = new JobObject(jobData);
 * console.log(job.type); // "job"
 * console.log(job.data.title); // Job title
 * // Jobs can have either url or job_text
 * if ('url' in job.data) {
 *   console.log(job.data.url); // External job URL
 * } else {
 *   console.log(job.data.job_text); // Job description text
 * }
 * ```
 */
export class JobObject extends HitObject {
  /**
   * Type-safe tag array guaranteed to contain a job tag.
   */
  public override readonly tags: TagArrayWithJob;

  /**
   * Job-specific data excluding highlighting and tag information.
   */
  public override readonly data: Omit<Job, "_highlightResult" | "_tags">;

  /**
   * Creates a new JobObject instance.
   * @param hit - Raw job data from the Algolia API
   * @param debug - Whether to enable debug logging
   */
  constructor(hit: Job, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Job");
  }

  /**
   * Gets the type of this object.
   * @returns "job"
   */
  override get type(): string {
    return "job";
  }
}
