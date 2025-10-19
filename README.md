# @j3lte/hn-client

[![JSR](https://jsr.io/badges/@j3lte/hn-client)](https://jsr.io/@j3lte/hn-client)
[![GitHub Release](https://img.shields.io/github/v/release/j3lte/hn-client)](https://github.com/j3lte/hn-client/releases/latest)
[![NPM Version](https://img.shields.io/npm/v/@j3lte/hn-client)](https://www.npmjs.com/package/@j3lte/hn-client)
[![NPM Downloads](https://img.shields.io/npm/dm/@j3lte/hn-client)](https://www.npmjs.com/package/@j3lte/hn-client)
[![License](https://img.shields.io/github/license/j3lte/hn-client)](https://github.com/j3lte/hn-client/blob/main/LICENSE)

A comprehensive TypeScript client for the Hacker News API powered by Algolia Search.

## ✨ Features

- 🔍 **Full-text search** across stories, comments, polls, and jobs
- 📰 **Pre-built methods** for common Hacker News sections (front page, newest, Ask HN, Show HN, etc.)
- 👤 **User-specific queries** (submissions, comments, threads)
- 🏷️ **Advanced filtering** with tags, numeric filters, and custom queries
- 📊 **Rich object models** with helper methods and type safety
- 🎯 **Flexible search parameters** (pagination, sorting, highlighting)
- 🐛 **Debug mode** for development and troubleshooting
- 📱 **Cross-platform** - works with Deno, Node.js, and browsers

## 🚀 Installation

### Deno (Recommended)

```bash
deno add @j3lte/hn-client
```

### NPM

```bash
npm install @j3lte/hn-client
```

## 📦 Documentation

- [Deno Docs](https://jsr.io/@j3lte/hn-client/doc)
- [NPM Package](https://www.npmjs.com/package/@j3lte/hn-client)

## 📖 Usage

### Basic Setup

```ts
import { HackerNewsClient } from "@j3lte/hn-client";

const client = new HackerNewsClient();
```

### Front Page Stories

```ts
// Get the latest front page stories
const { data } = await client.frontPage();

data.forEach(story => {
  console.log(`${story.title} - ${story.points} points`);
  console.log(`URL: ${story.url}`);
  console.log(`Comments: ${story.data.num_comments}`);
});
```

### Search with Custom Queries

```ts
// Search for stories about "machine learning"
const { data } = await client.search({
  query: "machine learning",
  tags: ["story"],
  hitsPerPage: 20
});

// Search with numeric filters (stories with 100+ points)
const { data: popularStories } = await client.search({
  query: "AI",
  tags: ["story"],
  numericFilters: ["points>=100"]
});
```

### User-Specific Queries

```ts
// Get all submissions by a user
const { data: userSubmissions } = await client.userSubmitted("pg");

// Get all comments by a user
const { data: userComments } = await client.userThreads("dang");

// Get everything (stories + comments) by a user
const { data: userAll } = await client.userAll("sama");
```

### Special Sections

```ts
// Ask HN posts
const { data: askHN } = await client.askHN();

// Show HN posts
const { data: showHN } = await client.showHN();

// Job postings
const { data: jobs } = await client.jobs();

// Polls
const { data: polls } = await client.polls();

// Newest stories and polls
const { data: newest } = await client.newest();
```

### Comments and Threads

```ts
// Get comments for a specific story
const { data: comments } = await client.commentsToStory(12345);

// Get comments for a story by a specific user
const { data: userCommentsOnStory } = await client.commentsToStory(12345, {
  userName: "dang"
});

// Get all recent comments
const { data: recentComments } = await client.comments();
```

### Advanced Search Examples

```ts
// Search with multiple tags using OR logic
import { Tags, OrTags } from "@j3lte/hn-client";

const { data } = await client.search({
  query: "startup",
  tags: [
    OrTags.from([Tags.STORY, Tags.COMMENT]),
    Tags.author("pg")
  ]
});

// Search with date filters (last 7 days)
const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
const { data: recentStories } = await client.search({
  query: "typescript",
  tags: ["story"],
  numericFilters: [`created_at_i>=${oneWeekAgo}`]
});

// Search with pagination
const { data: page2 } = await client.search({
  query: "react",
  tags: ["story"],
  page: 2,
  hitsPerPage: 50
});
```

### Working with Results

```ts
const { data, meta } = await client.frontPage();

console.log(`Found ${meta.numberOfHits} results`);
console.log(`Page ${meta.currentPage} of ${meta.numberOfPages}`);
console.log(`Processing time: ${meta.timeMsProcessing}ms`);

data.forEach(item => {
  console.log(`Type: ${item.type}`);
  console.log(`Title: ${item.title}`);
  console.log(`Author: ${item.data.author}`);
  console.log(`Created: ${item.createdAt}`);
  console.log(`Permalink: ${item.permaLink}`);

  // Type-specific properties
  if (item.type === "story") {
    console.log(`Points: ${item.data.points}`);
    console.log(`Comments: ${item.data.num_comments}`);
    console.log(`Has URL: ${item.hasExternalUrl}`);
  }
});
```

### Debug Mode

```ts
// Enable debug logging
const client = new HackerNewsClient({ debug: true });

// This will log request URLs and response metadata
const { data } = await client.search({ query: "test" });
```

### Custom Configuration

```ts
const client = new HackerNewsClient({
  debug: true,           // Enable debug logging
  objDebug: true,       // Enable object creation logging
  baseUrl: "https://hn.algolia.com/api/v1"  // Custom API endpoint
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
