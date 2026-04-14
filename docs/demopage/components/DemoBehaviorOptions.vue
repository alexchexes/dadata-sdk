<script lang="ts" setup>
import { CLEAR_ON_CHANGE_OPTIONS, SHOW_ON_FOCUS_OPTIONS } from '@dadata-sdk/vue';
import type { VueDadataOptions } from '@dadata-sdk/vue';
import { useI18n } from 'vue-i18n';

import OptionsBlock from './OptionsBlock.vue';
import ButtonAdd from './ui/ButtonAdd.vue';
import ButtonRemove from './ui/ButtonRemove.vue';
import CheckBox from './ui/CheckBox.vue';
import HelpHint from './ui/HelpHint.vue';
import InputText from './ui/InputText.vue';
import RadioGroup from './ui/RadioGroup.vue';

const props = defineProps<{
  canReset: boolean;
  helpLink: (propName: string) => string;
}>();

const collapsed = defineModel<boolean>({ default: false });
const options = defineModel<VueDadataOptions>('options', { required: true });

const emit = defineEmits<{
  resetClick: [];
}>();

const { t } = useI18n({ useScope: 'parent' });
</script>

<template>
  <OptionsBlock
    v-model="collapsed"
    :canReset="props.canReset"
    :heading="t('Vue component options')"
    :resetLable="t('Reset') + ' ' + t('Vue component options')"
    @resetClick="emit('resetClick')"
  >
    <div class="flex flex-wrap items-center gap-2">
      <span title=':minChars="..."'> {{ t('minChars') }}: </span>

      <div class="flex items-center gap-2">
        <ButtonRemove
          outline
          @click="options.minChars = Math.max(1, (options.minChars || 1) - 1)"
        />

        <input
          v-model.number="options.minChars"
          class="w-20 rounded-lg border bg-white px-1.5 py-0.5 dark:bg-(--vp-input-bg-color)"
          min="1"
          step="1"
          type="number"
        />
        <ButtonAdd outline @click="options.minChars = (options.minChars || 0) + 1" />
      </div>
      <HelpHint :helpLink="props.helpLink('minChars')" tooltip />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span title=':debounce="..."'> {{ t('debounce') }}: </span>

      <div class="flex items-center gap-2">
        <ButtonRemove
          outline
          @click="options.debounce = Math.max(0, (options.debounce || 0) - 50)"
        />

        <input
          v-model.number="options.debounce"
          class="w-20 rounded-lg border bg-white px-1.5 py-0.5 dark:bg-(--vp-input-bg-color)"
          min="0"
          step="1"
          type="number"
        />
        <ButtonAdd outline @click="options.debounce = (options.debounce || 0) + 50" />
      </div>
      <HelpHint :helpLink="props.helpLink('debounce')" tooltip />
    </div>

    <RadioGroup
      v-model="options.showOnFocus"
      :label="t('showOnFocus')"
      :options="Object.fromEntries(SHOW_ON_FOCUS_OPTIONS.map((item) => [t(item.toString()), item]))"
      :helpLink="props.helpLink('showOnFocus')"
      helpTooltip
    />

    <RadioGroup
      v-model="options.clearOnChange"
      :label="t('clearOnChange')"
      :options="
        Object.fromEntries(CLEAR_ON_CHANGE_OPTIONS.map((item) => [t(item.toString()), item]))
      "
      :helpLink="props.helpLink('clearOnChange')"
      helpTooltip
    />

    <CheckBox
      v-model="options.selectOnBlur"
      :label="t('selectOnBlur')"
      :helpLink="props.helpLink('selectOnBlur')"
      helpTooltip
    />
    <CheckBox
      v-model="options.selectOnEnter"
      :label="t('selectOnEnter')"
      :helpLink="props.helpLink('selectOnEnter')"
      helpTooltip
    />
    <CheckBox
      v-model="options.enrichOnSelect"
      :label="t('enrichOnSelect')"
      :helpLink="props.helpLink('enrichOnSelect')"
      helpTooltip
    />
    <CheckBox
      v-model="options.addSpace"
      :label="t('addSpace')"
      :helpLink="props.helpLink('addSpace')"
      helpTooltip
    />
    <CheckBox
      v-model="options.continueSelecting"
      :label="t('continueSelecting')"
      :helpLink="props.helpLink('continueSelecting')"
      helpTooltip
    />
    <CheckBox
      v-model="options.showClearButton"
      :label="t('showClearButton')"
      :helpLink="props.helpLink('showClearButton')"
      helpTooltip
    />
    <CheckBox
      v-model="options.forceShow"
      :label="t('forceShow')"
      :helpLink="props.helpLink('forceShow')"
      helpTooltip
    />
    <CheckBox
      v-model="options.forceHide"
      :label="t('forceHide')"
      :helpLink="props.helpLink('forceHide')"
      helpTooltip
    />
    <CheckBox
      :label="t('focusOnMounted')"
      checked
      disabled
      :helpLink="props.helpLink('focusOnMounted')"
      helpTooltip
    />
    <CheckBox
      v-model="options.disabled"
      :label="t('disabled')"
      :helpLink="props.helpLink('disabled')"
      helpTooltip
    />
    <InputText
      v-model="options.placeholder"
      :label="t('placeholder:')"
      :placeholder="t('Not specified')"
      :helpLink="props.helpLink('placeholder')"
      helpTooltip
    />
    <InputText
      v-model="options.suggestionsHint"
      :label="t('suggestionsHint:')"
      :placeholder="t('Not specified')"
      :helpLink="props.helpLink('suggestionsHint')"
      helpTooltip
    />
    <InputText
      v-model="options.noSuggestionsHint"
      :label="t('noSuggestionsHint:')"
      :placeholder="t('Not specified')"
      :helpLink="props.helpLink('noSuggestionsHint')"
      helpTooltip
    />
  </OptionsBlock>
</template>
