<script lang="ts" setup>
import { computed, ref, watch, type PropType } from 'vue';
import ButtonAdd from './ButtonAdd.vue';
import ButtonRemove from './ButtonRemove.vue';
import InputText from './InputText.vue';
import SelectOptGroup from './SelectOptGroup.vue';
import type { VueDadataProps } from '@/VueDadata.vue';
import {
  ISO_CODE_RESTRICTION_TYPES,
  KLADR_ID_RESTRICTION_TYPES,
  FIAS_ID_RESTRICTION_TYPES,
  NAME_RESTRICTION_TYPES,
  TYPE_FULL_RESTRICTION_TYPES,
  type LocationRestriction,
  type SuggestType,
} from '@/index';

const props = defineProps({
  suggestType: { type: String as PropType<SuggestType>, required: true },
});

const locationsFilterModel = defineModel({
  type: [Object, Array, String, Number] as PropType<VueDadataProps['locationsFilter']>,
  required: false,
});

const LOCATION_RESTRICTION_CATEGORIES = computed(() => {
  let options;

  options = {
    byKladrId: KLADR_ID_RESTRICTION_TYPES,
  };

  if (props.suggestType === 'address') {
    options = {
      byName: NAME_RESTRICTION_TYPES,
      ...options,
      byFullType: TYPE_FULL_RESTRICTION_TYPES,
      byFiasId: FIAS_ID_RESTRICTION_TYPES,
      byIsoCode: ISO_CODE_RESTRICTION_TYPES,
    };
  } else if (props.suggestType === 'fias') {
    options = {
      byName: NAME_RESTRICTION_TYPES.filter((el) => el !== 'country'),
      ...options,
      byFiasId: FIAS_ID_RESTRICTION_TYPES,
      byFullType: TYPE_FULL_RESTRICTION_TYPES,
    };
  }

  return options;
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

    const availableKey = Object.values(LOCATION_RESTRICTION_CATEGORIES.value)
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
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      <div>locationsFilter:</div>

      <!-- Enable Locations Filter -->
      <ButtonAdd v-if="!enabled" @click="enable" />
      <ButtonRemove v-else outline @click="disable" />
    </div>

    <!-- List of restrictions inside a location -->
    <div v-if="editableLocationsFilter?.length" class="relative">
      <!-- Each restriction -->
      <div v-for="(oneLocation, locIdx) in editableLocationsFilter" :key="locIdx">
        <div class="flex gap-2 rounded-lg bg-white px-1 pt-2 pb-1 shadow-md">
          <!-- Remove restriction (one location) -->
          <ButtonRemove @click="editableLocationsFilter.splice(locIdx, 1)" />

          <!-- List of properties of a single restriction -->
          <div>
            <!-- Each property of a restriction -->
            <div v-for="(entry, entryIdx) in oneLocation" :key="entryIdx">
              <div class="flex items-center gap-2 text-xs">
                <!-- restriction type -->
                <SelectOptGroup
                  v-model="editableLocationsFilter[locIdx][entryIdx].restrType"
                  :class="
                    isDuplicatingType(locIdx, entryIdx) &&
                    'border-red-500! text-red-500 open:text-inherit'
                  "
                  :groups="LOCATION_RESTRICTION_CATEGORIES"
                />

                <!-- restriction value -->
                <InputText
                  v-model="editableLocationsFilter[locIdx][entryIdx].restrVal"
                  :placeholder="`enter ${editableLocationsFilter[locIdx][entryIdx].restrType}...`"
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

              <div class="flex items-center gap-1">
                <div class="my-1 text-xs text-gray-500">
                  AND<span v-if="entryIdx === oneLocation.length - 1">...</span>
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

            <div v-if="findDuplicates(locIdx).length" class="text-sm text-red-500">
              Duplicating "AND" conditions
            </div>
          </div>
        </div>

        <div v-if="editableLocationsFilter.length" class="my-1 flex items-center gap-1 text-xs">
          <div>OR<span v-if="locIdx === editableLocationsFilter.length - 1">...</span></div>

          <!-- Add a new location -->
          <ButtonAdd v-if="locIdx === editableLocationsFilter.length - 1" @click="addNewLocation" />
        </div>
      </div>
    </div>
  </div>
</template>
