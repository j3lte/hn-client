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
  return unescape(text, { entityList });
};

export class HitObject {
  public readonly debug: boolean;
  public readonly highlight: Record<string, HighlightResult>;
  public readonly tags: string[];
  public data: Omit<Hit, "_highlightResult" | "_tags">;

  constructor(hit: Hit, debug = false) {
    this.debug = debug;
    const { _highlightResult, _tags, ...data } = hit;
    this.highlight = filterHighlightedFields(_highlightResult);
    this.tags = _tags;
    this.data = data;
  }

  get type(): string {
    return "hit";
  }

  get permaLink(): string {
    return getPermaLink(this.data.objectID);
  }

  get createdAt(): Date | null {
    return this.data.created_at ? parseISO(this.data.created_at) : null;
  }

  reportCreateDebug(type: string): void {
    if (this.debug) {
      console.log(`[DEBUG OBJ] ${type} ${this.data.objectID}`);
    }
  }
}

export class StoryObject extends HitObject {
  public override readonly tags: TagArrayWithStory;
  public override readonly data: Omit<Story, "_highlightResult" | "_tags">;

  constructor(hit: Story, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Story");
  }

  get isSelfpost(): boolean {
    return !!this.data.story_text;
  }

  get title(): string {
    return unescapeHtml(this.data.title);
  }

  get hasExternalUrl(): boolean {
    return !!this.data.url;
  }

  get url(): string {
    return this.data.url ?? this.permaLink;
  }

  override get type(): string {
    return "story";
  }
}

export class CommentObject extends HitObject {
  public override readonly tags: TagArrayWithComment;
  public override readonly data: Omit<Comment, "_highlightResult" | "_tags">;

  constructor(hit: Comment, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Comment");
  }

  get title(): string {
    return `New comment by ${this.data.author} in "${unescapeHtml(this.data.story_title)}"`;
  }

  get isRootComment(): boolean {
    return this.data.parent_id === this.data.story_id;
  }

  override get type(): string {
    return "comment";
  }
}

export class PollObject extends HitObject {
  public override readonly tags: TagArrayWithPoll;
  public override readonly data: Omit<Poll, "_highlightResult" | "_tags">;

  constructor(hit: Poll, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Poll");
  }

  override get type(): string {
    return "poll";
  }
}

export class PollOptionObject extends HitObject {
  public override readonly tags: TagArrayWithPollOption;
  public override readonly data: Omit<PollOption, "_highlightResult" | "_tags">;

  constructor(hit: PollOption, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Poll Option");
  }

  override get type(): string {
    return "pollopt";
  }
}

export class JobObject extends HitObject {
  public override readonly tags: TagArrayWithJob;
  public override readonly data: Omit<Job, "_highlightResult" | "_tags">;

  constructor(hit: Job, debug = false) {
    super(hit, debug);
    const { _tags, _highlightResult, ...data } = hit;
    this.tags = _tags;
    this.data = data;
    this.reportCreateDebug("Job");
  }

  override get type(): string {
    return "job";
  }
}
