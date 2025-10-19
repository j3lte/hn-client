import type { Comment, Hit, Job, Poll, PollOption, Story } from "./types.ts";

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
