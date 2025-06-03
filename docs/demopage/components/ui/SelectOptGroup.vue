<script lang="ts" setup>
defineProps<{
  /** An object where keys are group labels and values are arrays of option values. */
  groups: Record<string, readonly string[]>;
}>();

const model = defineModel({ type: String });
</script>

<template>
  <select v-model="model" class="rounded-lg border bg-white dark:bg-(--vp-input-bg-color)">
    <template v-for="(options, group) in groups" :key="group">
      <optgroup :label="group">
        <option v-for="option in options" :key="option" :value="option">
          {{ option }}
        </option>
      </optgroup>
    </template>
  </select>
</template>
