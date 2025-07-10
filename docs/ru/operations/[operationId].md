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

const operationId = route.data.params?.operationId
</script>

<OAOperation :operationId="operationId" />
