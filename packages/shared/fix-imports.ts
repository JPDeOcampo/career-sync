import { replaceInFileSync } from "replace-in-file";

const options = {
  files: "dist/**/*.js",
  from: /from\s+['"](\.\.?\/[^'"]+)['"]/g,
  to: (match: string, p1: string) => {
    if (p1.endsWith(".js")) return match;
    return `from '${p1}.js'`;
  },
};

try {
  const results = replaceInFileSync(options);
  console.log("Modified files:", results.filter((r) => r.hasChanged).length);
} catch (error) {
  console.error("Error occurred:", error);
}
