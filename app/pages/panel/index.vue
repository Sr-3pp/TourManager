<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
})

await navigateTo('/panel/users', { redirectCode: 302 })
</script>
