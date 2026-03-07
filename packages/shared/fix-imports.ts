import { replaceInFileSync } from "replace-in-file";

const options = {
  files: "dist/**/*.js",
  // This regex looks for internal imports/exports (starting with ./)
  // and ensures they end with .js if they don't already.
  from: /from\s+['"](\.\.?\/[^'"]+)(?<!\.js)['"]/g,
  to: "from '$1.js'",
};

try {
  const results = replaceInFileSync(options);
  console.log("Modified files:", results.filter((r) => r.hasChanged).length);
} catch (error) {
  console.error("Error occurred:", error);
}
