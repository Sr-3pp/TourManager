import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { reactive } from 'vue'
import TourBookingSidebar from '~~/app/components/Tour/BookingSidebar.vue'
import TourFormBasics from '~~/app/components/Tour/FormBasics.vue'

describe('tour components', () => {
  it('renders booking summary details', async () => {
    const component = await mountSuspended(TourBookingSidebar, {
      props: {
        formattedDate: '20 de marzo de 2026',
        formattedPrice: '$1,200',
        organizerName: 'Ruta Norte',
        packageCount: 2,
        departureCount: 3,
        location: 'Monterrey',
      },
    })

    expect(component.text()).toContain('Resumen de reserva')
    expect(component.text()).toContain('Ruta Norte')
    expect(component.text()).toContain('$1,200')
  })

  it('binds base tour form fields', async () => {
    const draft = reactive({
      name: 'Tour del desierto',
      description: 'Salida guiada',
      location: 'Sonora',
      date: '2026-03-20T10:00',
      price: 500,
      attendees: [],
      sponsors: [],
      packages: [],
      departure_points: [],
    })

    const component = await mountSuspended(TourFormBasics, {
      props: { draft },
    })

    expect(component.text()).toContain('Nombre del tour')
    expect(component.text()).toContain('Precio del tour')
    expect((component.vm as { draft: typeof draft }).draft.name).toBe('Tour del desierto')
  })
})
