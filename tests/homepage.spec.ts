import { expect, test } from '@nuxt/test-utils/playwright'

test('homepage renders featured tours hero copy', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Descubre tours destacados')
  await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
})
