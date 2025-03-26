import { useLocaleConfig } from "@vuepress/helper/client";
import { useClipboard, useEventListener } from "@vueuse/core";
import { usePageData } from "vuepress/client";

import "../styles/copy-code.scss";

const SHELL_RE = /language-(shellscript|shell|bash|sh|zsh)/;

// https://ecosystem.vuejs.press/zh/plugins/features/copy-code.html
export const useCopyCode = ({
  duration = 2000,
  locales,
  copyElement,
  ignoreSelector = [],
  transform,
}) => {
  if (__VUEPRESS_SSR__) return;

  const locale = useLocaleConfig(locales);
  const page = usePageData();

  if (copyElement) {
    copyElement.setAttribute("title", locale.value.copy);
    copyElement.setAttribute("aria-label", locale.value.copy);
    copyElement.setAttribute("data-copied", locale.value.copied);
  }

  const { copy } = useClipboard({ legacy: true });
  const timeoutIdMap = new WeakMap();

  const copyContent = (codeContainer, codeContent, button) => {
    const clone = codeContent.cloneNode(true);

    if (ignoreSelector.length) {
      clone.querySelectorAll(ignoreSelector.join(",")).forEach((node) => node.remove());
    }

    if (transform) transform(clone);

    let text = clone.textContent || "";

    if (SHELL_RE.test(codeContainer.className)) {
      text = text.replace(/^ *(\$|>) /gm, "");
    }

    copy(text).then(() => {
      if (duration <= 0) return;

      button.classList.add("copied");
      clearTimeout(timeoutIdMap.get(button));
      const timeoutId = setTimeout(() => {
        button.classList.remove("copied");
        timeoutIdMap.delete(button);
      }, duration);
      timeoutIdMap.set(button, timeoutId);
    });
  };

  useEventListener("click", (event) => {
    const el = event.target;

    if (el.matches(".demo-btns > .demo-copy-code-btn")) {
      const codeContainer = el
        .closest(".demo-btns")
        .nextElementSibling.querySelector('div[class*="language-"]');
      const preBlock = codeContainer.querySelector("pre");

      if (!codeContainer || !preBlock) return;

      copyContent(codeContainer, preBlock, el);
    }
  });
};
