import { getComponentsFromDir } from "@vuepress/plugin-register-components";

// ref https://github.com/vuepress/ecosystem/blob/abd787c/plugins/tools/plugin-register-components/src/node/prepareClientConfigFile.ts
export const prepareClientConfigFile = async (app, options, identifier) => {
  const componentsFromDir = await getComponentsFromDir(options);
  const componentsMap = {
    ...componentsFromDir,
    ...options.components,
  };

  const content = `\
import { defineAsyncComponent } from 'vue'
${Object.entries(options.syncComponents).map(
  ([name, filepath]) => `
import ${name} from ${JSON.stringify(filepath)}`,
)}

export default {
  enhance: ({ app }) => {
    ${Object.entries(componentsMap).map(
      ([name, filepath]) =>
        `app.component(${JSON.stringify(name)}, defineAsyncComponent(() => import(${JSON.stringify(
          filepath,
        )})))`,
    )}
    ${Object.entries(options.syncComponents).map(
      ([name]) => `app.component(${JSON.stringify(name)}, ${name})`,
    )}
  },
}
`;
  // write temp file and return the file path
  return app.writeTemp(`register-components/clientConfig.${identifier}.js`, content);
};
