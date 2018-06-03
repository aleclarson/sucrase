#!./script/sucrase-node
/* eslint-disable no-console */
import run from "./run";

const TSC = "./node_modules/.bin/tsc";
const TSLINT = "./node_modules/.bin/tslint";
const ESLINT = "./node_modules/.bin/eslint";

async function checkSucrase(): Promise<void> {
  await Promise.all([
    run(`${TSC} --project . --noEmit`),
    run(`${TSLINT} --project .`),
    run(
      `${ESLINT} ${["benchmark", "example-runner", "generator", "script", "src", "test"]
        .map((dir) => `'${dir}/**/*.ts'`)
        .join(" ")}`,
    ),
  ]);
}

checkSucrase().catch((e) => {
  console.error("Unhandled error:");
  console.error(e);
});
