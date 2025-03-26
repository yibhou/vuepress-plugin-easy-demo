<template>
  <div class="demo-layout">
    <div class="demo-title" v-if="$slots.title">
      <slot name="title"></slot>
    </div>
    <div class="demo-showcase">
      <component :is="componentName" v-if="componentName && !isShowCase" v-bind="$attrs" />
    </div>
    <div class="demo-btns">
      <i class="demo-btn" title="查看源代码" @click="handleShowSource">
        <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" width="1.2em" height="1.2em" data-v-8b2e4b12=""><path fill="currentColor" d="m23 12l-7.071 7.071l-1.414-1.414L20.172 12l-5.657-5.657l1.414-1.414L23 12zM3.828 12l5.657 5.657l-1.414 1.414L1 12l7.071-7.071l1.414 1.414L3.828 12z"></path></svg>
      </i>
      <i class="demo-btn demo-copy-code-btn" ref="copyElement"></i>
    </div>
    <Transition
      name="demo-collapse-transition"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div class="demo-source" ref="source" v-show="isShowSource">
        <slot name="source"></slot>
      </div>
    </Transition>
    <Transition name="demo-fade-transition">
      <div class="demo-collapse" v-show="isShowSource" @click="handleShowSource">隐藏源代码</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useCopyCode } from "../composables";

const props = defineProps({
  componentName: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const copyElement = ref(null);
onMounted(() => {
  useCopyCode({
    locales: {
      "/": {
        copy: "复制代码",
        copied: "已复制",
      },
    },
    copyElement: copyElement.value,
    // ignoreSelector: [".token.comment"],
  });
});

if (!__VUEPRESS_SSR__) {
  const { proxy } = getCurrentInstance();
  console.log(proxy.$lang);
}

const isShowCase = ref(__VUEPRESS_SSR__);
const isShowSource = ref(false);

const handleShowSource = () => {
  isShowSource.value = !isShowSource.value;
};

let onBeforeEnter, onEnter, onAfterEnter, onBeforeLeave, onLeave, onAfterLeave;

onBeforeEnter = onLeave = (el) => {
  el.style.maxHeight = "0";
};
onEnter = onBeforeLeave = (el) => {
  el.style.maxHeight = `${el.scrollHeight}px`;
};
onAfterEnter = onAfterLeave = (el) => {
  el.style.maxHeight = "";
};
</script>

<style lang="scss">
@import "../styles/index.scss";
</style>
