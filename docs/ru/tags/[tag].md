---
title: vitepress-openapi
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useTheme } from 'vitepress-openapi/client'

useTheme({
  i18n: { 
    locale: 'ru'
  }
})
const route = useRoute()

const tag = route.data.params?.tag
</script>

<OASpec :tags="[tag]" hide-info hide-servers hide-paths-summary />
