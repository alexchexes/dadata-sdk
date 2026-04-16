---
outline: [1, 6]
---

<script setup lang="ts">
import { useRoute } from 'vitepress'
import OpenApiContent from '../../components/OpenApiContent.vue'
import { useTheme } from 'vitepress-openapi/client'

useTheme({
  i18n: { 
    locale: 'en'
  }
})
const route = useRoute()

const tag = route.data.params?.tag
</script>

_If you're interested in the English version of this spec, let us know [on the GitHub](https://github.com/alexchexes/dadata-sdk)._

<OpenApiContent>
<OASpec :tags="[tag]" hide-info hide-servers hide-paths-summary />
</OpenApiContent>
