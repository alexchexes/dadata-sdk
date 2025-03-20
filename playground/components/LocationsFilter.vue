<script lang="ts" setup>
import { ref, watch, type PropType } from 'vue';
import type { LocationRestriction } from '@/types';
import ButtonAdd from './ButtonAdd.vue';
import ButtonRemove from './ButtonRemove.vue';
import InputText from './InputText.vue';
import SelectOptGroup from './SelectOptGroup.vue';
import { LOCATION_RESTRICTION_CATEGORIES } from '@/const';

const locationsFilterModel = defineModel({
  type: [Object, Array, undefined] as PropType<LocationRestriction | LocationRestriction[]>,
  required: false,
});

type LocationRestrictionEntry = {
  restrType: keyof LocationRestriction;
  restrVal: string;
};

const editableLocationsFilter = ref<LocationRestrictionEntry[][]>([]);

const defaultRestrictionEntry: LocationRestrictionEntry = {
  restrType: 'country',
  restrVal: '',
};

let locationsFilterModelWatchGuard = false;
let editableLocationsFilterWatchGuard = false;

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
    const locFilter = Array.isArray(newVal) ? newVal : [newVal];
    // Transform each object into an array of { restrType, restrVal } entries
    const transformed = locFilter.map((item) =>
      Object.entries(item).map(
        ([restrType, restrVal]) => ({ restrType, restrVal }) as LocationRestrictionEntry,
      ),
    );
    editableLocationsFilterWatchGuard = true;
    editableLocationsFilter.value = transformed;
  },
  { immediate: true, deep: true },
);

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
    newEntry = { ...defaultRestrictionEntry };
  } else {
    const alreadyUsedTypes = location.map((entry) => entry.restrType);

    const availableKey = Object.values(LOCATION_RESTRICTION_CATEGORIES)
      .flat()
      .find((key) => !alreadyUsedTypes.includes(key));

    newEntry = availableKey
      ? { restrType: availableKey, restrVal: '' }
      : { ...defaultRestrictionEntry };
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

const enabled = ref(false);

function enable() {
  if (!editableLocationsFilter.value.length) {
    editableLocationsFilter.value.push([{ ...defaultRestrictionEntry }]);
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

      <!-- Add new location -->
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
          <ButtonAdd
            v-if="locIdx === editableLocationsFilter.length - 1"
            @click="editableLocationsFilter.push([{ ...defaultRestrictionEntry }])"
          />
        </div>
      </div>
    </div>
  </div>
</template>
