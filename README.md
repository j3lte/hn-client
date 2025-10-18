# @j3lte/hn-client

[![JSR](https://jsr.io/badges/@j3lte/hn-client)](https://jsr.io/@j3lte/hn-client)
[![GitHub Release](https://img.shields.io/github/v/release/j3lte/hn-client)](https://github.com/j3lte/hn-client/releases/latest)
[![NPM Version](https://img.shields.io/npm/v/@j3lte/hn-client)](https://www.npmjs.com/package/@j3lte/hn-client)
[![NPM Downloads](https://img.shields.io/npm/dm/@j3lte/hn-client)](https://www.npmjs.com/package/@j3lte/hn-client)
[![License](https://img.shields.io/github/license/j3lte/hn-client)](https://github.com/j3lte/hn-client/blob/main/LICENSE)

A client for the Hacker News API.

## ✨ Features

- Get the latest news from Hacker News.

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

```ts
import { HackerNewsClient } from "@j3lte/hn-client";

const client = new HackerNewsClient();
const { data } = await client.frontPage();

console.log(data.map((hit) => hit.title));
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
