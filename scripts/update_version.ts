const denoVersion = Deno.args[0];

if (!denoVersion) {
  console.error("Please provide a version number");
  Deno.exit(1);
}

const denoFile = await Deno.readTextFile("./deno.json");
const newText = denoFile.replace(/"version": ".*"/, `"version": "${denoVersion}"`);

await Deno.writeTextFile("./deno.json", newText);

const utilsFile = await Deno.readTextFile("./src/util/index.ts");
const newUtilsText = utilsFile.replace(/VERSION = ".*"/, `VERSION = "${denoVersion}"`);

await Deno.writeTextFile("./src/util/index.ts", newUtilsText);

console.log(`Updated version to ${denoVersion}`);
