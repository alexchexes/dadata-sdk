<script lang="ts" setup>
import type { DeepPartial } from '@dadata-sdk/api-types';
import { ObsoleteResponseError, VueDadata, buildPayload } from '@dadata-sdk/vue';
import type { DadataSuggestion, SuggestOptions } from '@dadata-sdk/vue';
import '@dadata-sdk/vue/dist/vue-dadata.css';
import { useMediaQuery } from '@vueuse/core';
import { withBase } from 'vitepress';
import { computed, onMounted, ref, toRef, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import demopageLocales from '../locales-demopage';
import DemoApiOptions from './components/DemoApiOptions.vue';
import DemoBehaviorOptions from './components/DemoBehaviorOptions.vue';
import DemoGeneralOptions from './components/DemoGeneralOptions.vue';
import LiveSnippet from './components/LiveSnippet.vue';
import AButton from './components/ui/AButton.vue';
import CheckBox from './components/ui/CheckBox.vue';
import IconCross from './components/ui/IconCross.vue';
import IconReset from './components/ui/IconReset.vue';
import TogglableButton from './components/ui/TogglableButton.vue';
import { useDemoPageOptions } from './composables/useDemoPageOptions';
import { ORDERED_SUGGEST_TYPES } from './demo-page.const';
import './demopage.css';

const { lang = 'en' } = defineProps<{
  lang?: 'en' | 'ru';
}>();

const { t, locale } = useI18n({
  messages: demopageLocales,
  useScope: 'local',
});

watch(
  () => lang,
  (value) => {
    locale.value = value;
  },
);

locale.value = lang;

const envToken = import.meta.env.VITE_APP_DADATA_API_KEY as string;

const {
  TOKEN_PLACEHOLDER,
  allApiOptionsDefault,
  allBehaviorOptionsDefault,
  allGeneralOptionsDefault,
  allOptionsDefault,
  boundTypesOptions,
  boundTypesOptionsFrom,
  isTokenProvided,
  locationsBoostModel,
  locationsExamples,
  nonDefaultOptions,
  options,
  resetAllOptions,
  resetApiOptions,
  resetBehaviorOptions,
  resetGeneralOptions,
  showCustomHeaders,
  showCustomPayload,
  tokenModel,
} = useDemoPageOptions({
  envToken,
  lang: toRef(() => lang),
  t,
});

const showLiveSnippet = ref(true);
const showAllOptions = ref(false);
const showBuiltPayload = ref(false);
const showMoreActions = ref(false);
const showSuggestionsList = ref(false);
const examplesShown = ref(false);

const query = ref('');
const suggestion = ref<DadataSuggestion | undefined>(undefined);

const shownError = ref<{ title: string; description?: string | null; data: unknown } | null>(null);
const showTokenError = ref(false);

const vueDadataRef = useTemplateRef('vueDadataRef');

const isScreenXl = useMediaQuery('(width >= 80rem)');
const isScreenMd = useMediaQuery('(width >= 48rem)');

const behaviorOptionsCollapsed = ref(false);
const apiOptionsCollapsed = ref(false);
const generalOptionsCollapsed = ref(false);

onMounted(() => {
  behaviorOptionsCollapsed.value = !isScreenXl.value;
  apiOptionsCollapsed.value = !isScreenMd.value;
});

const builtPayload = computed(() =>
  buildPayload({ ...options.value, query: query.value } as SuggestOptions),
);

const displayedOptions = computed(() =>
  isTokenProvided.value ? options.value : { ...options.value, token: TOKEN_PLACEHOLDER },
);

const suggestionsList = computed(() => vueDadataRef.value?.suggestionsList ?? []);

const propsLink = (propName: string) => withBase(`/${lang}/vue#${propName.toLowerCase()}`);

const clearSuggestion = () => {
  query.value = '';
  suggestion.value = undefined;
};

const clearError = () => {
  shownError.value = null;
  showTokenError.value = false;
};

const setSuggestion = () => {
  suggestion.value = {
    value: 'г Москва',
    unrestricted_value: '101000, г Москва',
    // @ts-expect-error This is a synthetic demo object rather than a real suggestion payload.
    data: {
      code: 'example',
      name: 'example',
    },
  };
};

const manualUpdate = () => {
  try {
    vueDadataRef.value?.update();
  } catch (error) {
    if (!(error instanceof ObsoleteResponseError)) {
      console.warn('Failed to update:', error);
    }
  }
};

const handleEnriched = (
  currentSuggestion: DadataSuggestion,
  diff: DeepPartial<DadataSuggestion> | null,
) => {
  shownError.value = null;
  showTokenError.value = false;
  console.info(`Suggestion enriched (${currentSuggestion.value}), diff:`, diff);
};

const handleEnrichFail = (unrestrictedValue: string) => {
  console.warn('Failed to enrich suggestion:', unrestrictedValue);
};

const handleError = (error: any) => {
  console.error('VueDadata error:', error);

  if (error && typeof error === 'object') {
    if (error.status === 403 && options.value.token === envToken) {
      showTokenError.value = true;
      return;
    }

    showTokenError.value = false;
    shownError.value = {
      title: t('Something went wrong...'),
      description: error,
      data: error.response?.data,
    };
  }
};

const handleSelect = (selectedSuggestion: DadataSuggestion, type: string) => {
  console.info(type, JSON.parse(JSON.stringify(selectedSuggestion)));
};
</script>

<template>
  <div class="text-(--vp-c-text-1)">
    <AButton
      v-if="!allOptionsDefault"
      class="fixed top-5 left-1/2 z-50 flex -translate-x-1/2 gap-1 pr-1.5 text-sm text-(--vp-c-text-2)"
      @click="resetAllOptions"
    >
      {{ t('Reset all') }}
      <IconReset height="20" width="20" />
    </AButton>

    <div
      class="grid grid-cols-1 grid-rows-[auto_1fr] gap-4 p-4 md:grid-cols-[20rem_1fr] xl:mx-auto xl:max-w-(--breakpoint-2xl) xl:grid-cols-[20rem_auto_20rem]"
    >
      <aside class="md:row-start-1 xl:col-start-1 xl:row-start-1">
        <DemoBehaviorOptions
          v-model="behaviorOptionsCollapsed"
          v-model:options="options"
          :canReset="!allBehaviorOptionsDefault"
          :helpLink="propsLink"
          @resetClick="resetBehaviorOptions"
        />
      </aside>

      <aside class="md:col-start-1 md:row-start-2 xl:col-start-3 xl:row-start-1">
        <DemoApiOptions
          v-model="apiOptionsCollapsed"
          v-model:examplesShown="examplesShown"
          v-model:locationsBoost="locationsBoostModel"
          v-model:options="options"
          :boundTypesOptions="boundTypesOptions"
          :boundTypesOptionsFrom="boundTypesOptionsFrom"
          :canReset="!allApiOptionsDefault"
          :helpLink="propsLink"
          :locationsExamples="locationsExamples"
          @resetClick="resetApiOptions"
        />
      </aside>

      <main
        class="flex w-full min-w-0 flex-col gap-3 md:col-start-2 md:row-span-2 md:row-start-1 xl:col-start-2 xl:row-start-1 xl:mx-auto xl:max-w-5xl"
      >
        <DemoGeneralOptions
          v-model="generalOptionsCollapsed"
          v-model:options="options"
          v-model:showCustomHeaders="showCustomHeaders"
          v-model:showCustomPayload="showCustomPayload"
          v-model:token="tokenModel"
          :canReset="!allGeneralOptionsDefault"
          :orderedSuggestTypes="ORDERED_SUGGEST_TYPES"
          :showTokenError="showTokenError"
          :tokenPlaceholder="TOKEN_PLACEHOLDER"
          @resetClick="resetGeneralOptions"
        />

        <div class="flex flex-wrap items-center gap-3">
          <CheckBox v-model="showLiveSnippet" :label="t('Show live snippet')" />
          <CheckBox v-model="showAllOptions" :label="t('Show all options')" />
          <CheckBox v-model="showBuiltPayload" :label="t('Show payload')" />
        </div>

        <div v-if="showLiveSnippet">
          <LiveSnippet
            :nonDefaultOptions
            :options
            :showToken="isTokenProvided"
            :query
            :suggestion
          />
        </div>

        <pre
          v-if="showAllOptions"
          class="rounded-xl bg-(--vp-c-bg-alt) px-4 py-2 text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap"
        ><b>{{ t('Current component options:') }} </b> {{ displayedOptions }}</pre>

        <pre
          v-if="showBuiltPayload"
          class="rounded-xl bg-(--vp-c-bg-alt) px-4 py-2 text-[14px] [overflow-wrap:anywhere] whitespace-pre-wrap"
        ><b>{{ t('Final payload:') }} </b>{{ builtPayload }}</pre>

        <div class="flex flex-wrap gap-1">
          <div class="mr-1">
            {{ t('Methods:') }}
          </div>

          <AButton :disabled="vueDadataRef?.isFocused" @mousedown.prevent="vueDadataRef?.focus()"
            >focus</AButton
          >
          <AButton :disabled="!vueDadataRef?.isFocused" @mousedown.prevent="vueDadataRef?.blur()"
            >blur</AButton
          >
          <AButton :disabled="!query && !suggestion" @mousedown.prevent="vueDadataRef?.clear()"
            >clear</AButton
          >
          <AButton
            :disabled="
              !vueDadataRef?.suggestionsList?.length ||
              vueDadataRef?.isDropdownVisible ||
              options.forceHide
            "
            @mousedown.prevent="vueDadataRef?.show()"
            >show</AButton
          >
          <AButton
            :disabled="!vueDadataRef?.suggestionsList?.length || !vueDadataRef?.isDropdownVisible"
            @mousedown.prevent="vueDadataRef?.hide()"
            >hide</AButton
          >

          <TogglableButton
            v-model="showMoreActions"
            type="checkbox"
            :value="true"
            :label="t('more')"
          />
        </div>

        <div v-if="showMoreActions" class="flex flex-wrap gap-2">
          <div class="flex flex-wrap gap-1">
            <AButton :disabled="!suggestion" @mousedown.prevent="suggestion = undefined">
              {{ t('Clear v-model:suggestion') }}
            </AButton>
            <AButton @mousedown.prevent="setSuggestion">{{ t('Set v-model:suggestion') }}</AButton>
            <AButton @mousedown.prevent="manualUpdate">update</AButton>
          </div>
          <CheckBox v-model="showSuggestionsList" :label="t(`Show 'suggestionsList' array`)" />
        </div>

        <h2 class="text-5xl leading-relaxed font-semibold">
          {{ t('Try here:') }}
        </h2>

        <VueDadata
          ref="vueDadataRef"
          v-model="query"
          v-model:suggestion="suggestion"
          class="text-slate-950"
          :focusOnMounted="true"
          :token="options.token"
          v-bind="{ ...nonDefaultOptions }"
          @enriched="handleEnriched"
          @enrichFail="handleEnrichFail"
          @error="handleError"
          @select="handleSelect"
        />

        <div
          v-if="showTokenError || shownError"
          class="relative rounded-xl bg-(--vp-c-danger-soft) px-3 py-2 text-(--vp-c-danger-1)"
        >
          <template v-if="showTokenError">
            <div class="font-bold">
              {{ t('Oops...') }}
            </div>
            <div>
              {{
                t(
                  'Looks like the API token used on this page has reached its limit. Obtain a new token from',
                )
              }}
              <a
                class="underline hover:no-underline"
                href="https://dadata.ru/profile/#info"
                rel="noopener"
                target="_blank"
                >Dadata.ru</a
              >
              {{ t('and paste it into') }} <i>'{{ t('General options') }}'</i> →
              <i>'{{ t('API token') }}'</i> {{ t('above') }}
            </div>
          </template>
          <template v-else>
            <div class="font-bold">
              {{ shownError?.title || 'Error' }}
            </div>
            <div v-if="shownError?.description">
              {{ shownError.description }}
            </div>
            <template v-if="shownError?.data">
              <div>{{ t('Received response:') }}</div>
              <pre class="text-sm wrap-anywhere whitespace-pre-wrap">{{ shownError.data }}</pre>
            </template>
          </template>

          <button
            class="absolute top-3 right-3 cursor-pointer hover:opacity-70"
            @click="clearError"
          >
            <IconCross />
          </button>
        </div>

        <div class="flex gap-2 max-md:flex-col">
          <div class="min-h-96 min-w-0 flex-1 rounded-xl bg-(--vp-c-bg-alt) px-4 py-2">
            <div class="flex justify-between">
              <span>
                {{ t('Current suggestion:') }}
                <span v-if="!suggestion" class="text-(--vp-c-text-3) opacity-50">
                  — ({{ typeof suggestion }})</span
                >
              </span>
              <AButton v-if="suggestion" @click="clearSuggestion">{{ t('Clear') }}</AButton>
            </div>

            <pre v-if="suggestion" class="text-[14px] wrap-anywhere whitespace-pre-wrap">{{
              suggestion
            }}</pre>
          </div>

          <div
            v-if="showSuggestionsList"
            class="min-h-96 min-w-0 flex-1 rounded-xl bg-(--vp-c-bg-alt) px-4 py-2"
          >
            <div class="flex justify-between">
              <span>
                {{ t('Suggestions list:') }}
              </span>
            </div>
            [
            <pre
              v-for="(sug, idx) in suggestionsList"
              :key="idx"
              class="mb-4 ml-3 max-h-52 overflow-auto text-[14px] wrap-anywhere whitespace-pre-wrap"
              >{{ sug }}</pre
            >
            ]
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
