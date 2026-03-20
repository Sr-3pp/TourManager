<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
})

const seo = useSeo()

seo.noIndex()

useSeoMeta({
  title: `Panel | ${seo.siteName.value}`,
  description: 'Panel administrativo de Tour Manager.',
})

await navigateTo('/panel/users', { redirectCode: 302 })
</script>
