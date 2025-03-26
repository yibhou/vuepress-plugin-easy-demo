import { getDirname, hash, path } from "vuepress/utils";
import { prepareClientConfigFile } from "./plugins/registerComponentsPlugin/prepareClientConfigFile.js";
import chokidar from "chokidar";
import { importCodePlugin } from "./plugins/importCodePlugin/importCodePlugin.js";
import container from "./container.js";

const __dirname = getDirname(import.meta.url);

export const easyDemoPlugin = ({
  components = {},
  componentsDir = null,
  componentsPatterns = ["**/*.vue"],
  getComponentName = (filename) => path.trimExt(filename.replace(/\/|\\/g, "-")),
} = {}) => {
  const options = {
    components,
    componentsDir,
    componentsPatterns,
    getComponentName,
    syncComponents: {
      DemoLayout: path.resolve(__dirname, "../client/components/DemoLayout.vue"),
    },
  };
  const optionsHash = hash(options);

  const handleImportPath = (str) => path.resolve(componentsDir, str);
  return (app) => {
    return {
      name: "vuepress-plugin-easy-demo",
      clientConfigFile: (app) => prepareClientConfigFile(app, options, optionsHash),
      extendsMarkdown: (md) => {
        md.use(importCodePlugin, { handleImportPath });
        md.use(container, options);
      },
      onWatched: (app, watchers) => {
        if (componentsDir) {
          const componentsWatcher = chokidar.watch(componentsPatterns, {
            cwd: componentsDir,
            ignoreInitial: true,
          });
          componentsWatcher.on("add", () => {
            prepareClientConfigFile(app, options, optionsHash);
          });
          componentsWatcher.on("unlink", () => {
            prepareClientConfigFile(app, options, optionsHash);
          });
          watchers.push(componentsWatcher);
        }
      },
    };
  };
};

export default easyDemoPlugin;
