import { describe, expect, it } from 'vitest'
import {
  buildTourFormData,
  normalizePackageDrafts,
  toEditableTourState,
} from '~~/app/utils/tour-form'

describe('tour form helpers', () => {
  it('normalizes duplicate package levels', () => {
    const packages = normalizePackageDrafts([
      { level: 1, name: 'Bronce', description: '', price: 100, benefits: [] },
      { level: 1, name: 'Plata', description: '', price: 200, benefits: [] },
    ])

    expect(packages.map(pkg => pkg.level)).toEqual([1, 2])
  })

  it('maps tours into editable form state', () => {
    const state = toEditableTourState({
      _id: 'tour-1',
      name: 'Tour norte',
      description: 'Prueba',
      date: '2026-03-20T10:00:00.000Z',
      location: 'Monterrey',
      image: null,
      price: 900,
      attendees: [],
      sponsors: [],
      packages: [],
      departure_points: [],
    })

    expect(state.name).toBe('Tour norte')
    expect(state.date).toContain('2026-03-20')
  })

  it('builds multipart form data for tour saves', () => {
    const formData = buildTourFormData({
      name: 'Tour sur',
      description: 'Salida',
      location: 'Oaxaca',
      date: '2026-03-20T10:00',
      price: 1200,
      attendees: [],
      sponsors: [],
      packages: [],
      departure_points: [],
    })

    expect(formData.get('name')).toBe('Tour sur')
    expect(formData.get('price')).toBe('1200')
    expect(formData.get('packages')).toBe('[]')
  })
})
