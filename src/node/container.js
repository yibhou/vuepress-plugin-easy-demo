import { path } from "vuepress/utils";
import container from "markdown-it-container";
import MarkdownIt from "markdown-it";

const localMd = new MarkdownIt();

export default (md, options) => {
  const { componentsDir, getComponentName } = options;
  md.use(container, "easy-demo", {
    validate(params) {
      return params.trim().match(/^easy-demo\s*(.*)$/);
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^easy-demo\s*(.*)$/);
      if (tokens[idx].nesting === 1) {
        const title = m && m.length > 1 ? m[1] : "";
        const importDemoMeta = tokens[idx + 1].type === "import_demo" ? tokens[idx + 1].meta : {};
        const { importPath } = importDemoMeta;
        const componentName = getComponentName(path.relative(componentsDir, importPath));
        const encodedOptions = encodeURI(JSON.stringify(options));
        return `<demo-layout componentName="${componentName}" :options="JSON.parse(decodeURI('${encodedOptions}'))">
          ${
            title
              ? `<template v-slot:title>${localMd.render(title)}</template>`
              : ""
          }
          <template v-slot:source>`;
      } else {
        return "</template></demo-layout>";
      }
    },
  });
};
