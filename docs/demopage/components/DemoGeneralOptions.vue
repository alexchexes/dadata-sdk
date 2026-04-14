<script lang="ts" setup>
import { BASE_SUGGEST_URL } from '@dadata-sdk/api-types';
import type { SuggestType } from '@dadata-sdk/api-types';
import type { VueDadataOptions } from '@dadata-sdk/vue';
import { useI18n } from 'vue-i18n';

import OptionsBlock from './OptionsBlock.vue';
import ButtonAdd from './ui/ButtonAdd.vue';
import ButtonRemove from './ui/ButtonRemove.vue';
import CheckBox from './ui/CheckBox.vue';
import InputJson from './ui/InputJson.vue';
import InputText from './ui/InputText.vue';
import RadioGroup from './ui/RadioGroup.vue';

const props = defineProps<{
  canReset: boolean;
  orderedSuggestTypes: SuggestType[];
  showTokenError: boolean;
  tokenPlaceholder: string;
}>();

const collapsed = defineModel<boolean>({ default: false });
const options = defineModel<VueDadataOptions>('options', { required: true });
const showCustomHeaders = defineModel<boolean>('showCustomHeaders', { default: false });
const showCustomPayload = defineModel<boolean>('showCustomPayload', { default: false });
const token = defineModel<string>('token', { default: '' });

const emit = defineEmits<{
  resetClick: [];
}>();

const { t } = useI18n({ useScope: 'parent' });

const removeCustomPayload = () => {
  showCustomPayload.value = false;
  options.value.payload = undefined;
};

const removeCustomHeaders = () => {
  showCustomHeaders.value = false;
  options.value.headers = undefined;
};
</script>

<template>
  <OptionsBlock
    v-model="collapsed"
    class="pb-3"
    :canReset="props.canReset"
    :heading="t('General options')"
    :resetLable="`${t('Reset')} ${t('General options')}`"
    @resetClick="emit('resetClick')"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-1">
        <RadioGroup
          v-model="options.suggestType"
          :options="
            Object.fromEntries(
              props.orderedSuggestTypes.map((item) => [t(`suggestTypes.${item}`, item), item]),
            )
          "
          buttonClass="px-3 py-1.5"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <InputText
          v-model.trim="token"
          class="grow"
          :class="props.showTokenError && 'text-red-500 dark:text-red-400'"
          :inputClass="props.showTokenError && 'border-red-500! dark:border-red-400!'"
          :label="t('API token:')"
          :placeholder="props.tokenPlaceholder"
        />

        <InputText
          v-model.trim="options.url"
          class="grow"
          :placeholder="BASE_SUGGEST_URL + options.suggestType"
          label="API URL:"
        />
      </div>

      <div class="flex flex-wrap items-start gap-x-3 gap-y-2">
        <div class="flex grow basis-1/3 flex-col gap-3">
          <div class="flex gap-2">
            <ButtonAdd v-if="!showCustomPayload" @click="showCustomPayload = true" />
            <ButtonRemove v-else outline @click="removeCustomPayload()" />
            <span>
              {{ showCustomPayload ? t('Remove custom payload') : t('Add custom payload...') }}
            </span>
          </div>

          <InputJson
            v-if="showCustomPayload"
            v-model.lazy="options.payload"
            class="w-full"
            :placeholder="t('customPayloadPlaceholder')"
            :rows="4"
          />
        </div>

        <div class="flex grow basis-1/3 flex-col gap-3">
          <div class="flex gap-2">
            <ButtonAdd v-if="!showCustomHeaders" @click="showCustomHeaders = true" />
            <ButtonRemove v-else outline @click="removeCustomHeaders()" />
            <span>
              {{ showCustomHeaders ? t('Remove custom headers') : t('Add custom headers...') }}
            </span>
          </div>

          <InputJson
            v-if="showCustomHeaders"
            v-model.lazy="options.headers"
            class="w-full"
            :placeholder="t('customHeadersPlaceholder')"
            :rows="4"
          />
        </div>

        <CheckBox v-model="options.httpCache" class="gap-2" :label="t('httpCache')" />
      </div>
    </div>
  </OptionsBlock>
</template>
