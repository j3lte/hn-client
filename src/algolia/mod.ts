import { buildSearchParams, Tags } from "./helpers.ts";
import { CommentObject, HitObject, JobObject, PollObject, PollOptionObject, StoryObject } from "./objects.ts";
import type { AlgoliaResponse, Comment, Job, Poll, PollOption, SearchParams, Story } from "./types.ts";
import { VERSION } from "../util/index.ts";

export type HNSearchClientOptions = {
  debug?: boolean;
  objDebug?: boolean;
  baseUrl?: string;
};

export type HNSearchClientSearchResponse = {
  meta: {
    hitsPerPage: number;
    numberOfHits: number;
    numberOfPages: number;
    currentPage: number;
    timeMsProcessing: number;
    timeMsServer: number;
  };
  data: Array<StoryObject | CommentObject | PollObject | PollOptionObject | HitObject>;
};

export class HNSearchClient {
  private readonly baseUrl: string;
  private readonly debug: boolean;
  private readonly objDebug: boolean;

  constructor({ debug, objDebug, baseUrl }: HNSearchClientOptions = {}) {
    this.baseUrl = typeof baseUrl === "undefined" ? "https://hn.algolia.com/api/v1" : baseUrl;
    this.debug = typeof debug === "undefined" ? false : debug;
    this.objDebug = typeof objDebug === "undefined" ? false : objDebug;
  }

  /**
   * Search Hacker News using the Algolia API
   * @param params - Search parameters
   * @returns Promise resolving to AlgoliaResponse
   */
  async search(
    params: SearchParams = {},
    init: RequestInit = {},
  ): Promise<HNSearchClientSearchResponse> {
    const searchParams = {
      ...params,
      sortByDate: typeof params.sortByDate === "undefined" ? true : params.sortByDate,
      hitsPerPage: typeof params.hitsPerPage === "undefined"
        ? 100
        : params.hitsPerPage < 0
        ? 1
        : params.hitsPerPage > 100
        ? 100
        : params.hitsPerPage,
    } as SearchParams;
    const endpoint = searchParams.sortByDate ? "search_by_date" : "search";
    const url = `${this.baseUrl}/${endpoint}?${buildSearchParams(searchParams)}`;

    if (this.debug) {
      console.log(`[DEBUG REQ] ${url}`);
    }

    const headers: HeadersInit = init.headers ?? {};
    (headers as Record<string, string>)["User-Agent"] = `hn-client/${VERSION} (+https://github.com/j3lte/hn-client)`;
    init.headers = headers;

    const response = await fetch(url, init);
    if (!response.ok) {
      if (this.debug) {
        console.log(`[DEBUG RES ERR] ${response.status} ${response.statusText}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.json() as AlgoliaResponse;

    if (this.debug) {
      console.log(
        `[DEBUG RES] ${res.nbHits}|${res.nbPages}|${res.page}|${res.hitsPerPage} h/pp, ${res.processingTimeMS}ms processing, ${res.serverTimeMS}ms server`,
      );
    }

    const data = res.hits.map((hit) => {
      if (hit._tags.includes(Tags.STORY)) {
        return new StoryObject(hit as Story, this.objDebug);
      }
      if (hit._tags.includes(Tags.COMMENT)) {
        return new CommentObject(hit as Comment, this.objDebug);
      }
      if (hit._tags.includes(Tags.POLL)) {
        return new PollObject(hit as Poll, this.objDebug);
      }
      if (hit._tags.includes(Tags.POLLOPT)) {
        return new PollOptionObject(hit as PollOption, this.objDebug);
      }
      if (hit._tags.includes(Tags.JOB)) {
        return new JobObject(hit as Job, this.objDebug);
      }
      return new HitObject(hit, this.objDebug);
    });

    return {
      meta: {
        hitsPerPage: res.hitsPerPage,
        numberOfHits: res.nbHits,
        numberOfPages: res.nbPages,
        currentPage: res.page,
        timeMsProcessing: res.processingTimeMS,
        timeMsServer: res.serverTimeMS,
      },
      data,
    };
  }
}
