import { computed, onMounted, watch, type Ref } from 'vue';
import { useUrlSearchParams, type UseUrlSearchParamsOptions } from '@vueuse/core';

/**
 * Syncs a provided ref object with the URL search params.
 * If `nonDefaults` provided, will use it instead of 'objectRef' to set URL params
 * (while still populating objectRef when reading URL params)
 */
export function useSyncUrlParams<T extends Record<string, any>>(
  objectRef: Ref<T>,
  nonDefaults?: Ref<Partial<T>>,
  mode: 'history' | 'hash' | 'hash-params' = 'history',
  options: UseUrlSearchParamsOptions<T> = {},
) {
  // create a reactive object for the URL query parameters
  const urlParams = useUrlSearchParams<T>(mode, options);

  // on mount, read from urlParams and assign to the ref’s object
  onMounted(() => {
    for (const key of Object.keys(urlParams)) {
      let val = urlParams[key];
      if (/^\d+$/.test(val)) {
        val = Number(val);
      } else if (val === 'true' || val === 'false') {
        // Coerce 'true'/'false' to booleans
        val = val === 'true' ? true : val === 'false' ? false : val;
      } else if (/"/.test(val)) {
        try {
          val = JSON.parse(val);
        } catch {}
      }

      (objectRef.value as Record<string, unknown>)[key] = val;
    }
  });

  // watch either all properties or only those that specified in `nonDefaults`
  const objToWatch = computed(() => (nonDefaults?.value ? nonDefaults.value : objectRef.value));

  // watch for changes in the local object, and update urlParams
  watch(
    objToWatch,
    (newVal: Record<string, any>) => {
      // synchronize all keys in our object to the URL
      for (const key of Object.keys(newVal)) {
        let val = newVal[key];
        if (val && typeof val === 'object') {
          val = JSON.stringify(val);
        }
        (urlParams as Record<string, unknown>)[key] = val;
      }

      // remove old keys that no longer exist in objToWatch
      for (const key of Object.keys(urlParams)) {
        if (!(key in newVal)) {
          delete urlParams[key];
        }
      }
    },
    { deep: true },
  );

  return {
    urlParams,
  };
}
