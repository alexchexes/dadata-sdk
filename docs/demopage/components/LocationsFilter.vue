<script lang="ts" setup>
import type { LocationRestriction, SuggestType } from '@dadata-sdk/api-types';
import {
  FIAS_ID_RESTRICTION_TYPES,
  ISO_CODE_RESTRICTION_TYPES,
  KLADR_ID_RESTRICTION_TYPES,
  NAME_RESTRICTION_TYPES,
  POSTAL_CODE_RESTRICTION_TYPES,
  TYPE_FULL_RESTRICTION_TYPES,
} from '@dadata-sdk/vue';
import type { VueDadataOptions } from '@dadata-sdk/vue';
import { type PropType, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ButtonAdd from './ui/ButtonAdd.vue';
import ButtonRemove from './ui/ButtonRemove.vue';
import HelpHint from './ui/HelpHint.vue';
import InputText from './ui/InputText.vue';
import SelectOptGroup from './ui/SelectOptGroup.vue';

const { t } = useI18n({ useScope: 'parent' });

const props = defineProps<{
  suggestType: SuggestType;
  helpLink: string;
  helpTooltip?: boolean;
}>();

const locationsFilterModel = defineModel({
  type: [Object, Array, String, Number] as PropType<VueDadataOptions['locationsFilter']>,
  required: false,
});

const restrictionGroupsLabels = computed(() => {
  return {
    NAME: 'By name of...',
    TYPE: 'By type',
    ISO: 'By ISO code',
    FIAS: 'By FIAS ID',
    KLADR: 'By KLADR ID',
    POSTAL_CODE: 'By postal code',
  };
});

const restrictionsGroups = computed(() => {
  let options: Record<string, readonly (keyof LocationRestriction)[]> = {
    [restrictionGroupsLabels.value.KLADR]: KLADR_ID_RESTRICTION_TYPES,
  };

  if (props.suggestType === 'address') {
    return (options = {
      [restrictionGroupsLabels.value.NAME]: NAME_RESTRICTION_TYPES,
      ...options,
      [restrictionGroupsLabels.value.POSTAL_CODE]: POSTAL_CODE_RESTRICTION_TYPES,
      [restrictionGroupsLabels.value.TYPE]: TYPE_FULL_RESTRICTION_TYPES,
      [restrictionGroupsLabels.value.FIAS]: FIAS_ID_RESTRICTION_TYPES,
      [restrictionGroupsLabels.value.ISO]: ISO_CODE_RESTRICTION_TYPES,
    });
  } else if (props.suggestType === 'fias') {
    return (options = {
      [restrictionGroupsLabels.value.NAME]: NAME_RESTRICTION_TYPES.filter((el) => el !== 'country'),
      ...options,
      [restrictionGroupsLabels.value.POSTAL_CODE]: POSTAL_CODE_RESTRICTION_TYPES,
      [restrictionGroupsLabels.value.FIAS]: FIAS_ID_RESTRICTION_TYPES,
      [restrictionGroupsLabels.value.TYPE]: TYPE_FULL_RESTRICTION_TYPES,
    });
  }

  return options;
});

const restrictionGroupsLocalized = computed<{
  [k: string]: {
    [P in keyof LocationRestriction]: string;
  };
}>(() => {
  return Object.fromEntries(
    Object.entries(restrictionsGroups.value).map(([groupLabel, group]) => {
      return [
        t(groupLabel),
        Object.fromEntries(group.map((item) => [item, t(`filtersBy.${item}`, item)])),
      ];
    }),
  );
});

const isOnlyOneRestrictionType = computed(() => {
  const values = Object.values(restrictionsGroups.value);
  return values.length === 1 && values[0].length === 1;
});

type LocationRestrictionEntry = {
  restrType: keyof LocationRestriction;
  restrVal: string;
};

const editableLocationsFilter = ref<LocationRestrictionEntry[][]>([]);

const enabled = ref(false);

const defaultRestrictionEntry = computed<LocationRestrictionEntry>(() => ({
  restrType: props.suggestType === 'address' ? 'country' : 'kladr_id',
  restrVal: '',
}));

let locationsFilterModelWatchGuard = false;
let editableLocationsFilterWatchGuard = false;

const normalizeLocationItem = (
  item: string | number | LocationRestriction,
): LocationRestriction => {
  return typeof item === 'object' ? item : { kladr_id: String(item) };
};

// Watch the source model (locationsFilterModel) and update the editable ref
watch(
  locationsFilterModel,
  (newVal) => {
    if (locationsFilterModelWatchGuard) {
      locationsFilterModelWatchGuard = false;
      return;
    }

    if (!newVal) {
      editableLocationsFilterWatchGuard = true;
      editableLocationsFilter.value = [];
      return;
    }
    // Ensure newVal is always an array of objects
    const locFilter = Array.isArray(newVal)
      ? newVal.map(normalizeLocationItem)
      : [normalizeLocationItem(newVal)];

    // Transform each object into an array of { restrType, restrVal } entries
    const transformed = locFilter.map((item) =>
      Object.entries(item).map(
        ([restrType, restrVal]) => ({ restrType, restrVal }) as LocationRestrictionEntry,
      ),
    );

    editableLocationsFilterWatchGuard = true;
    editableLocationsFilter.value = transformed;

    if (editableLocationsFilter.value.length) {
      enabled.value = true;
    }
  },
  { immediate: true, deep: true },
);
editableLocationsFilterWatchGuard = false;

// Watch the editable ref and update the source model accordingly
watch(
  editableLocationsFilter,
  (newVal) => {
    if (editableLocationsFilterWatchGuard) {
      editableLocationsFilterWatchGuard = false;
      return;
    }

    if (!newVal || !newVal.length) {
      locationsFilterModelWatchGuard = true;
      locationsFilterModel.value = undefined;
      enabled.value = false;
      return;
    }

    // Reverse transformation: convert array of arrays back into an array of objects
    const originalFormat = newVal
      .map((innerArr) =>
        innerArr.reduce<Record<string, string>>((obj, { restrType, restrVal }) => {
          if (restrVal) {
            obj[restrType] = restrVal;
          }
          return obj;
        }, {}),
      )
      .filter((obj) => Object.keys(obj).length > 0);

    // When there's only one element, set a single object; otherwise an array
    locationsFilterModelWatchGuard = true;
    locationsFilterModel.value = originalFormat.length === 1 ? originalFormat[0] : originalFormat;
  },
  { deep: true },
);

const addRestrictionToLocation = (locIdx: number) => {
  const location = editableLocationsFilter.value[locIdx];
  let newEntry;
  if (!location.length) {
    newEntry = { ...defaultRestrictionEntry.value };
  } else {
    const alreadyUsedTypes = location.map((entry) => entry.restrType);

    const availableKey = Object.values(restrictionsGroups.value)
      .flat()
      .find((key) => !alreadyUsedTypes.includes(key));

    newEntry = availableKey
      ? { restrType: availableKey, restrVal: '' }
      : { ...defaultRestrictionEntry.value };
  }
  editableLocationsFilter.value[locIdx].push(newEntry);
};

const findDuplicates = (locIdx: number): string[] => {
  const alreadyUsedTypes = editableLocationsFilter.value[locIdx].map((entry) => entry.restrType);
  const typeCounts = alreadyUsedTypes.reduce<Record<string, number>>((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(typeCounts).filter((type) => typeCounts[type] > 1);
};

const isDuplicatingType = (locIdx: number, entryIdx: number): boolean => {
  const restrType = editableLocationsFilter.value[locIdx][entryIdx].restrType;
  return findDuplicates(locIdx).includes(restrType);
};

const addNewLocation = () =>
  editableLocationsFilter.value.push([{ ...defaultRestrictionEntry.value }]);

function enable() {
  if (!editableLocationsFilter.value.length) {
    editableLocationsFilter.value.push([{ ...defaultRestrictionEntry.value }]);
  }
  enabled.value = true;
}
function disable() {
  editableLocationsFilter.value = [];
  enabled.value = false;
}

const getEnterRestrictionPlaceholder = (restrKey: string) => {
  let declened = t(`filtersBy.${restrKey}`, 2);
  declened = declened.replace('filtersBy.', '');
  // const declened = t(`enterRestriction.${restrKey}`, noDeclenFallback);
  return `${t('enter')} ${declened}...`;
};
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      <div class="inline-flex items-center gap-1">
        {{ t('locationsFilter:') }}
        <HelpHint :helpLink :tooltip="props.helpTooltip" />
      </div>

      <!-- Enable Locations Filter -->
      <ButtonAdd v-if="!enabled" @click="enable" />
      <ButtonRemove v-else outline @click="disable" />
    </div>

    <!-- List of restrictions inside a location -->
    <div v-if="editableLocationsFilter?.length" class="relative">
      <!-- Each restriction -->
      <div v-for="(oneLocation, locIdx) in editableLocationsFilter" :key="locIdx">
        <div
          class="flex gap-2 rounded-lg border border-(--vp-c-divider) bg-(--vp-c-bg) px-1 pt-2 pb-1"
        >
          <!-- Remove restriction (one location) -->
          <ButtonRemove @click="editableLocationsFilter.splice(locIdx, 1)" />

          <!-- List of properties of a single restriction -->
          <div class="grow">
            <!-- Each property of a restriction -->
            <div v-for="(entry, entryIdx) in oneLocation" :key="entryIdx">
              <div class="flex items-center gap-2 text-xs">
                <!-- restriction type -->
                <SelectOptGroup
                  v-model="editableLocationsFilter[locIdx][entryIdx].restrType"
                  :class="[
                    'w-1/2',
                    isDuplicatingType(locIdx, entryIdx) &&
                      'border-red-500! text-red-500 open:text-inherit dark:border-red-400! dark:text-red-400',
                  ]"
                  :groups="restrictionGroupsLocalized"
                />

                <!-- restriction value -->
                <InputText
                  v-model="editableLocationsFilter[locIdx][entryIdx].restrVal"
                  :placeholder="
                    getEnterRestrictionPlaceholder(
                      editableLocationsFilter[locIdx][entryIdx].restrType,
                    )
                  "
                />
                <!-- Remove restriction inside a location -->
                <ButtonRemove
                  class="size-5"
                  outline
                  @click="
                    () => {
                      editableLocationsFilter[locIdx].splice(entryIdx, 1);
                      if (!editableLocationsFilter[locIdx].length) {
                        editableLocationsFilter.splice(locIdx, 1);
                      }
                    }
                  "
                />
              </div>

              <div v-if="!isOnlyOneRestrictionType" class="flex items-center gap-1">
                <div class="my-1 text-xs text-gray-500">
                  {{ t('AND') }}<span v-if="entryIdx === oneLocation.length - 1">...</span>
                </div>
                <!-- Add new restriction to existing location -->
                <ButtonAdd
                  v-if="entryIdx === oneLocation.length - 1"
                  class="size-5"
                  outline
                  @click="addRestrictionToLocation(locIdx)"
                />
              </div>
            </div>

            <div
              v-if="findDuplicates(locIdx).length"
              class="text-sm text-red-500 dark:text-red-400"
            >
              {{ t('Duplicating "AND" conditions') }}
            </div>
          </div>
        </div>

        <div
          v-if="editableLocationsFilter.length"
          class="my-1 flex items-center justify-center gap-1 text-xs"
        >
          <div>
            {{ t('OR') }}<span v-if="locIdx === editableLocationsFilter.length - 1">...</span>
          </div>

          <!-- Add a new location -->
          <ButtonAdd v-if="locIdx === editableLocationsFilter.length - 1" @click="addNewLocation" />
        </div>
      </div>
    </div>
  </div>
</template>
