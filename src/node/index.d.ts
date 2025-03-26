import type { Plugin } from "vuepress/core";
import type { RegisterComponentsPluginOptions } from "@vuepress/plugin-register-components";

export declare const easyDemoPlugin: ({
  components,
  componentsDir,
  componentsPatterns,
  getComponentName,
}?: RegisterComponentsPluginOptions) => Plugin;

/** @deprecated Use named export instead */
export default easyDemoPlugin;
