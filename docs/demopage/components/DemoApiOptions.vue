<script lang="ts" setup>
import {
  BANK_STATUSES,
  BANK_TYPES,
  BRANCH_TYPES,
  DIVISION_TYPES,
  FIO_GENDERS,
  FIO_PARTS,
  LANGUAGES,
  MAX_SUG_COUNT,
  PARTY_BY_STATUSES,
  PARTY_BY_TYPES,
  PARTY_KZ_TYPES,
  PARTY_STATUSES,
  PARTY_TYPES,
  type SuggestType,
} from '@dadata-sdk/api-types';
import { DEFAULT_OPTIONS } from '@dadata-sdk/vue';
import type { VueDadataOptions } from '@dadata-sdk/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  JSON_FILTER_SUGGEST_TYPES,
  SUGGEST_TYPES_WITH_BOUNDS,
  SUGGEST_TYPES_WITH_ENTITY_STATUS,
  SUGGEST_TYPES_WITH_LOCATIONS,
  SUGGEST_TYPES_WITH_LOCATION_EXAMPLES,
  SUGGEST_TYPES_WITH_RESTRICT_VALUE,
} from '../demo-page.const';
import LocationsFilter from './LocationsFilter.vue';
import OptionsBlock from './OptionsBlock.vue';
import RadiusFilter from './RadiusFilter.vue';
import AButton from './ui/AButton.vue';
import CheckBox from './ui/CheckBox.vue';
import InputJson from './ui/InputJson.vue';
import InputText from './ui/InputText.vue';
import RadioGroup from './ui/RadioGroup.vue';
import SelectOptions from './ui/SelectOptions.vue';
import TogglesGroup from './ui/TogglesGroup.vue';

const props = defineProps<{
  boundTypesOptions: Record<string, string>;
  boundTypesOptionsFrom: Record<string, string>;
  canReset: boolean;
  helpLink: (propName: string) => string;
  locationsExamples: Record<string, unknown>;
}>();

const collapsed = defineModel<boolean>({ default: false });
const examplesShown = defineModel<boolean>('examplesShown', { default: false });
const locationsBoost = defineModel<string>('locationsBoost', { default: '' });
const options = defineModel<VueDadataOptions>('options', { required: true });

const emit = defineEmits<{
  resetClick: [];
}>();

const { t } = useI18n({ useScope: 'parent' });

const suggestType = computed<SuggestType>(
  () => (options.value.suggestType || DEFAULT_OPTIONS.suggestType) as SuggestType,
);

const showLocationsControls = computed(() =>
  SUGGEST_TYPES_WITH_LOCATIONS.includes(suggestType.value),
);
const showLocationExamples = computed(() =>
  SUGGEST_TYPES_WITH_LOCATION_EXAMPLES.includes(suggestType.value),
);
const showRestrictValue = computed(
  () =>
    !!options.value.locationsFilter &&
    SUGGEST_TYPES_WITH_RESTRICT_VALUE.includes(suggestType.value),
);
const showBoundTypes = computed(() => SUGGEST_TYPES_WITH_BOUNDS.includes(suggestType.value));
const showAddressOnlyOptions = computed(() => suggestType.value === 'address');
const showEntityStatus = computed(() =>
  SUGGEST_TYPES_WITH_ENTITY_STATUS.includes(suggestType.value),
);
const showJsonFilters = computed(() => JSON_FILTER_SUGGEST_TYPES.includes(suggestType.value));

const entityStatusOptions = computed(() => {
  const statusesByType = {
    party: PARTY_STATUSES,
    party_by: PARTY_BY_STATUSES,
    bank: BANK_STATUSES,
  };
  const statuses = statusesByType[suggestType.value as keyof typeof statusesByType] || [];

  return Object.fromEntries(
    statuses.map((item) => [t(`entityStatus.${suggestType.value}.${item}`, item), item]),
  );
});
</script>

<template>
  <OptionsBlock
    v-model="collapsed"
    :canReset="props.canReset"
    :heading="t('API request options')"
    :resetLable="`${t('Reset')} ${t('API request options')}`"
    @resetClick="emit('resetClick')"
  >
    <div class="flex flex-wrap items-center gap-2">
      {{ t('count:') }}
      <div class="flex items-center gap-2">
        <input
          v-model.number="options.count"
          class="accent-accent"
          :max="MAX_SUG_COUNT"
          min="1"
          step="1"
          type="range"
        />
        <div class="w-5">
          {{ options.count }}
        </div>
      </div>
    </div>

    <template v-if="showLocationsControls">
      <div class="dev-item">
        <InputText
          v-model="locationsBoost"
          :helpLink="props.helpLink('locationsBoost')"
          :label="t('locationsBoost:')"
          :placeholder="t(`KLADR ID or IDs, e.g. '77, 46'`)"
        />
      </div>

      <div v-if="showLocationExamples">
        <div>
          {{ t('locationsFilter examples:') }}
          <AButton class="text-sm" @click="examplesShown = !examplesShown">
            {{ examplesShown ? t('Hide') : t('Show') }}
          </AButton>
        </div>

        <RadioGroup
          v-if="examplesShown"
          v-model="options.locationsFilter"
          class="mt-2 flex flex-col gap-1"
          :options="props.locationsExamples"
        />
      </div>

      <LocationsFilter
        v-model="options.locationsFilter"
        :helpLink="props.helpLink('locationsFilter')"
        :suggestType="suggestType"
      />
    </template>

    <CheckBox
      v-if="showRestrictValue"
      v-model="options.restrictValue"
      :label="t('restrictValue')"
      :helpLink="props.helpLink('restrictValue')"
    />

    <template v-if="showBoundTypes">
      <div class="flex flex-wrap gap-3">
        <SelectOptions
          v-model="options.fromBound"
          :helpLink="props.helpLink('fromBound')"
          :label="t('fromBound:')"
          :options="props.boundTypesOptionsFrom"
        />
        <SelectOptions
          v-model="options.toBound"
          :helpLink="props.helpLink('toBound')"
          :label="t('toBound:')"
          :options="props.boundTypesOptions"
        />
      </div>
    </template>

    <template v-if="showAddressOnlyOptions">
      <RadiusFilter v-model="options.radiusFilter" :helpLink="props.helpLink('radiusFilter')" />

      <RadioGroup
        v-model="options.division"
        :label="t('division:')"
        :options="Object.fromEntries(DIVISION_TYPES.map((item) => [t(item), item]))"
        :helpLink="props.helpLink('division')"
      />

      <RadioGroup
        v-model="options.language"
        :label="t('language:')"
        :options="Object.fromEntries(LANGUAGES.map((item) => [t(item), item]))"
        :helpLink="props.helpLink('language')"
      />
    </template>

    <RadioGroup
      v-if="suggestType === 'party'"
      v-model="options.entityType"
      :label="t('entityType.label-party', 'entityType:')"
      :options="
        Object.fromEntries(
          [undefined, ...PARTY_TYPES].map((item) => [
            t(item ? `entityType.${item}` : 'entityType.any', item || 'any'),
            item,
          ]),
        )
      "
      :helpLink="props.helpLink('entityType')"
    />
    <TogglesGroup
      v-else-if="suggestType === 'party_by'"
      v-model="options.entityType"
      :label="t('entityType.label-party', 'entityType:')"
      :options="
        Object.fromEntries(PARTY_BY_TYPES.map((item) => [t(`entityType.${item}`, item), item]))
      "
      :helpLink="props.helpLink('entityType')"
    />
    <TogglesGroup
      v-else-if="suggestType === 'party_kz'"
      v-model="options.entityType"
      :label="t('entityType.label-party', 'entityType:')"
      :options="
        Object.fromEntries(PARTY_KZ_TYPES.map((item) => [t(`entityType.${item}`, item), item]))
      "
      :helpLink="props.helpLink('entityType')"
    />
    <TogglesGroup
      v-else-if="suggestType === 'bank'"
      v-model="options.entityType"
      :label="t('entityType.label-bank', 'entityType:')"
      :options="Object.fromEntries(BANK_TYPES.map((item) => [t(`entityType.${item}`, item), item]))"
      :helpLink="props.helpLink('entityType')"
    />

    <TogglesGroup
      v-if="showEntityStatus"
      v-model="options.entityStatus"
      :helpLink="props.helpLink('entityStatus')"
      :label="t(`entityStatus.${suggestType}.label`, 'entityStatus:')"
      :options="entityStatusOptions"
    />

    <RadioGroup
      v-if="suggestType === 'party'"
      v-model="options.branchType"
      :label="t('branchType.label', 'branchType:')"
      :options="
        Object.fromEntries(
          [undefined, ...BRANCH_TYPES].map((item) => [
            t(item ? `branchType.${item}` : 'branchType.any', item || 'any'),
            item,
          ]),
        )
      "
      :helpLink="props.helpLink('branchType')"
    />

    <template v-if="suggestType === 'fio'">
      <TogglesGroup
        v-model="options.fioParts"
        :label="t('fioParts:')"
        :options="Object.fromEntries(FIO_PARTS.map((item) => [t(item), item]))"
      />

      <RadioGroup
        v-model="options.fioGender"
        :label="t('fioGender:')"
        :options="
          Object.fromEntries(
            [undefined, ...FIO_GENDERS].map((item) => [t(item || 'gender-any', 'any'), item]),
          )
        "
      />
    </template>

    <InputJson
      v-if="showJsonFilters"
      v-model="options.filters"
      class="flex-col gap-1"
      :label="t('filters (json)')"
      :placeholder="t(`'filters' API request parameter`)"
      allowArray
    />
  </OptionsBlock>
</template>
