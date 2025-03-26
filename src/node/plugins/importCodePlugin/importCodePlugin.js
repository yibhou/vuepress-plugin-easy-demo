import { createImportCodeBlockRule } from "./createImportCodeBlockRule.js";
import { resolveImportCode } from "./resolveImportCode.js";

// ref https://github.com/vuepress/core/blob/main/packages/markdown/src/plugins/importCodePlugin/importCodePlugin.ts
export const importCodePlugin = (md, options = {}) => {
  // add import_demo block rule
  md.block.ruler.before("fence", "import_demo", createImportCodeBlockRule(options), {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  // add import_demo renderer rule
  md.renderer.rules.import_demo = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];

    // use imported code as token content
    const { importFilePath, importCode } = resolveImportCode(token.meta, env);
    token.content = importCode;

    // extract imported files to env
    if (importFilePath) {
      (env.importedFiles ??= []).push(importFilePath);
    }

    // render the import_demo token as a fence token
    if (md.renderer.rules.fence) {
      return md.renderer.rules.fence(tokens, idx, options, env, slf);
    }
  };
};
