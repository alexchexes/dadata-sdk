---
outline: [1, 6]
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import OpenApiContent from '../../components/OpenApiContent.vue'
import { useTheme } from 'vitepress-openapi/client'

useTheme({
  i18n: { 
    locale: 'ru'
  }
})
const route = useRoute()

const tag = route.data.params?.tag
</script>

<OpenApiContent>
<OASpec :tags="[tag]" hide-info hide-servers hide-paths-summary></OASpec>
</OpenApiContent>
