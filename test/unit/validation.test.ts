import { describe, expect, it } from 'vitest'
import {
  normalizeBoolean,
  normalizeDate,
  normalizeNumber,
  normalizeString,
  parseMultipartJson,
} from '~~/server/utils/validation'

describe('server validation helpers', () => {
  it('normalizes required strings', () => {
    expect(normalizeString('  Tour Manager  ', 'name', { required: true })).toBe('Tour Manager')
  })

  it('rejects invalid booleans', () => {
    expect(() => normalizeBoolean('maybe', 'featured')).toThrow(/featured must be a boolean/)
  })

  it('normalizes numbers with minimums', () => {
    expect(normalizeNumber('15', 'price', { required: true, min: 0 })).toBe(15)
    expect(() => normalizeNumber('-1', 'price', { min: 0 })).toThrow(/price must be at least 0/)
  })

  it('parses valid multipart json and dates', () => {
    expect(parseMultipartJson('[1,2]', 'items')).toEqual([1, 2])
    expect(normalizeDate('2026-03-20T12:30', 'date')).toBeInstanceOf(Date)
  })
})
