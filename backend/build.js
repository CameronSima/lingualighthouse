const { build } = require("esbuild");
const tsNode = require("ts-node");
const fs = require("fs");
const { glob } = require("glob");
const path = require("path");

const lambdaHandlersDir = "./backend"; // Replace with the actual directory path to your Lambda handlers

async function buildHandlers() {
  console.log("Running");
  const tsNodeInstance = tsNode.register({
    transpileOnly: true,
    compilerOptions: {
      module: "commonjs",
    },
  });

  const handlerFiles = await getHandlerFiles(lambdaHandlersDir);

  const promises = handlerFiles.map(async (file) => {
    console.log(file);
    const outfile = file
      .replace("backend/", "backend/dist/")
      .replace(".ts", ".js");

    await build({
      entryPoints: [file],
      outfile,
      platform: "node",
      target: "node14", // Choose the appropriate Node.js target version
      bundle: true,
      plugins: [
        {
          name: "ts-node",
          setup(build) {
            build.onLoad(
              { filter: /.*/, namespace: "ts-node" },
              async (args) => {
                const contents = await tsNodeInstance.compile(args.path);
                return { contents };
              }
            );
          },
        },
      ],
    });
  });
  await Promise.all([promises]);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const arcFiles = await getArcFiles(lambdaHandlersDir);
  // copy arc files to dist
  const copyPromises = arcFiles.map(async (file) => {
    const outfile = file.replace("backend/", "backend/dist/");
    await fs.promises.copyFile(file, outfile);
  });

  await Promise.all([copyPromises]);
}

async function getArcFiles(dir) {
  const arcPattern = path.join(dir, "**/*.arc");
  return await glob(arcPattern, {
    ignore: ["backend/dist/**"],
  });
}
async function getHandlerFiles(dir) {
  const pattern = path.join(dir, "**/*.ts");
  const files = await glob(pattern, {
    ignore: ["backend/dist/**"],
  });
  return files;
}

buildHandlers().catch((e) => {
  console.log(e);
  process.exit(1);
});
