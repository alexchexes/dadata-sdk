<script lang="ts" setup>
import { DEFAULT_GEO_RADIUS, MAX_GEO_RADIUS } from '@/const';
import type { RadiusFilter } from '@/types';
import { computed, ref, watch, type PropType } from 'vue';
import InputText from './InputText.vue';
import ButtonAdd from './ButtonAdd.vue';
import ButtonRemove from './ButtonRemove.vue';

const model = defineModel({ type: Object as PropType<RadiusFilter>, required: false });

const lat = ref('53.194119');
const lon = ref('50.154362');
const radius = ref(DEFAULT_GEO_RADIUS);

const enabled = ref(false);

const innerRadiusFilter = computed(() => {
  return (
    (enabled.value && {
      lat: lat.value.trim(),
      lon: lon.value.trim(),
      radius_meters: Number(radius.value),
    }) ||
    undefined
  );
});

watch(innerRadiusFilter, () => (model.value = innerRadiusFilter.value));

const checkIfCoordValid = (oneCoord: string) => /^-?\d+(\.\d+)*$/.test(oneCoord.trim());
const isLatValid = computed(() => checkIfCoordValid(lat.value));
const isLonValid = computed(() => checkIfCoordValid(lon.value));
const isRadiusValid = computed(() => {
  return (
    /^\d+$/.test(String(radius.value).trim()) &&
    Number(radius.value) > 0 &&
    Number(radius.value) <= MAX_GEO_RADIUS
  );
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-2">
      radiusFilter: <ButtonAdd v-if="!enabled" @click="enabled = true" />
      <ButtonRemove v-else outline @click="enabled = false" />
    </div>

    <div v-if="enabled" class="flex flex-wrap gap-2">
      <InputText
        v-model.trim="lat"
        class="min-w-20 grow basis-5"
        :inputClass="lat && !isLatValid && 'ring-red-500! ring text-red-700'"
        label="lat"
        placeholder="50.123456"
      />
      <InputText
        v-model.trim="lon"
        class="min-w-20 grow basis-5"
        :inputClass="lon && !isLonValid && 'ring-red-500! ring text-red-700'"
        label="lon"
        placeholder="50.123456"
      />
      <InputText
        v-model.trim="radius"
        class="min-w-20 grow basis-5"
        :inputClass="!isRadiusValid && 'ring-red-500! ring text-red-700'"
        label="radius"
      />
    </div>
    radius: {{ radius }}, {{ typeof radius }}
  </div>
</template>
