import { VERSION } from "../util/index.ts";
/**
 * The type of item.
 */
export type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";

/**
 * The item type.
 */
export type Item = {
  id: number;
  type: ItemType;
  deleted?: boolean;
  dead?: boolean;
  by: string;
  time: number;
  parent?: number;
  text: string;
  title?: string;
  url?: string;
  score?: number;
  poll?: number;
  kids?: number[];
  parts?: number[];
  descendants?: number;
};

/**
 * The Hacker News API client.
 */
export class HNAPI {
  /**
   * The base URL for the Hacker News API.
   * @private
   */
  private readonly baseUrl: string = "https://hacker-news.firebaseio.com/v0/";

  /**
   * Fetch data from the Hacker News API (internal method).
   *
   * @param path - The path to the resource.
   * @param init - The request init.
   * @returns The data.
   *
   * @private
   */
  private async _fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = new URL(path, this.baseUrl).toString();

    const headers: HeadersInit = init.headers ?? {};
    (headers as Record<string, string>)["User-Agent"] = `hn-client/${VERSION} (+https://github.com/j3lte/hn-client)`;
    init.headers = headers;

    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Get the maximum item ID.
   * @returns The maximum item ID.
   */
  maxItemId(): Promise<number> {
    return this._fetch<number>("/maxitem.json");
  }

  /**
   * Get the top stories ids.
   * @returns The top stories ids.
   */
  topStories(): Promise<number[]> {
    return this._fetch<number[]>("/topstories.json");
  }

  /**
   * Get the new stories ids.
   * @returns The new stories ids.
   */
  newStories(): Promise<number[]> {
    return this._fetch<number[]>("/newstories.json");
  }

  /**
   * Get the best stories ids.
   * @returns The best stories ids.
   */
  bestStories(): Promise<number[]> {
    return this._fetch<number[]>("/beststories.json");
  }

  /**
   * Get the ask stories ids.
   * @returns The ask stories ids.
   */
  askStories(): Promise<number[]> {
    return this._fetch<number[]>("/askstories.json");
  }

  /**
   * Get the show stories ids.
   * @returns The show stories ids.
   */
  showStories(): Promise<number[]> {
    return this._fetch<number[]>("/showstories.json");
  }

  /**
   * Get the job stories ids.
   * @returns The job stories ids.
   */
  jobStories(): Promise<number[]> {
    return this._fetch<number[]>("/jobstories.json");
  }

  /**
   * Get the updates.
   * @returns The updates.
   */
  updates(): Promise<{ items: number[]; profiles: string[] }> {
    return this._fetch<{ items: number[]; profiles: string[] }>("/updates.json");
  }

  /**
   * Get the user.
   * @param id - The user id.
   * @returns The user.
   */
  user(id: string): Promise<{ id: string; created: number; karma: number; about: string; submitted: number[] }> {
    return this._fetch<{ id: string; created: number; karma: number; about: string; submitted: number[] }>(
      `/user/${id}.json`,
    );
  }

  /**
   * Get the item.
   * @param id - The item id.
   * @returns The item.
   */
  item(id: number): Promise<Item> {
    return this._fetch<Item>(`/item/${id}.json`);
  }
}
