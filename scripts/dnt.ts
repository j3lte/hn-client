import { build, emptyDir } from "@deno/dnt";
import pkg from "../deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  shims: {
    undici: true,
  },
  package: {
    // package.json properties
    name: "@j3lte/hn-client",
    version: Deno.args[0] || pkg.version,
    description: "A client for the Hacker News API.",
    author: {
      name: "Jelte Lagendijk",
      email: "jwlagendijk@gmail.com",
    },
    keywords: ["hacker", "news", "api"],
    license: "MIT",
    publishConfig: {
      access: "public",
    },
    repository: {
      type: "git",
      url: "git+https://github.com/j3lte/hn-client.git",
    },
    bugs: {
      url: "https://github.com/j3lte/hn-client/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
