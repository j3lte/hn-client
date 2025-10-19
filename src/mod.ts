import { OrTags, Tags } from "./algolia/helpers.ts";
import { HNSearchClient, type HNSearchClientOptions, type HNSearchClientSearchResponse } from "./algolia/mod.ts";
import type { NumericFilter, SearchParams, Tag } from "./algolia/types.ts";

export * from "./algolia/types.ts";
export { OrTags, Tags } from "./algolia/helpers.ts";
export * from "./algolia/objects.ts";

import { VERSION } from "./util/index.ts";

export class HackerNewsClient {
  public readonly version: string = VERSION;
  private searchClient: HNSearchClient;

  constructor(options: HNSearchClientOptions = {}) {
    this.searchClient = new HNSearchClient(options);
  }

  search(params: SearchParams, init: RequestInit = {}): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search(params, init);
  }

  frontPage(
    params: Omit<SearchParams, "tags" | "sortByDate" | "hitsPerPage">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    // Get unix timestamp for a week ago
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const numericFilters: NumericFilter[] = [
      `created_at_i>=${oneWeekAgo}`,
    ];
    return this.searchClient.search({
      ...params,
      tags: [Tags.FRONT_PAGE, Tags.STORY],
      numericFilters,
    }, init);
  }

  newest(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.POLL])],
    }, init);
  }

  comments(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.COMMENT],
    }, init);
  }

  askHN(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.ASK_HN],
    }, init);
  }

  showHN(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.SHOW_HN],
    }, init);
  }

  polls(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.POLL],
    }, init);
  }

  jobs(
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.JOB],
    }, init);
  }

  userAll(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.COMMENT, Tags.POLL]), Tags.author(userName)],
    }, init);
  }

  userThreads(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [Tags.COMMENT, Tags.author(userName)],
    }, init);
  }

  userSubmitted(
    userName: string,
    params: Omit<SearchParams, "tags" | "sortByDate">,
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    return this.searchClient.search({
      ...params,
      tags: [OrTags.from([Tags.STORY, Tags.POLL]), Tags.author(userName)],
    }, init);
  }

  commentsToStory(
    storyId: number,
    params: Omit<SearchParams, "tags" | "sortByDate"> & { userName?: string },
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    const { userName, ...rest } = params;
    const tags: (Tag | OrTags)[] = [Tags.COMMENT, Tags.story(storyId)];
    if (userName) {
      tags.push(Tags.author(userName));
    }
    return this.searchClient.search({ ...rest, tags }, init);
  }
}
