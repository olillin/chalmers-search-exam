import { exportedForTesting } from '../../src'
const { parseDateSweden } = exportedForTesting

it('can parse a date with no time during winter time (UTC+1)', () => {
    const result = parseDateSweden('2026-01-27').toISOString()
    const expected = '2026-01-26T23:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('can parse a date with time during winter time (UTC+1)', () => {
    const result = parseDateSweden('2026-01-27T14:00:00').toISOString()
    const expected = '2026-01-27T13:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('can parse a date with time parameter during winter time (UTC+1)', () => {
    const result = parseDateSweden('2026-01-27T02:00:00', '08:30').toISOString()
    const expected = '2026-01-27T07:30:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('handles summer time (UTC+2)', () => {
    const result = parseDateSweden('2026-06-02').toISOString()
    const expected = '2026-06-01T22:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('handles DST start', () => {
    const result = parseDateSweden('2026-10-25T00:00:00').toISOString()
    const expected = '2026-10-24T22:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('handles DST end', () => {
    const result = parseDateSweden('2026-03-29T00:00:00').toISOString()
    const expected = '2026-03-28T23:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('ignores explicit offsets', () => {
    const result = parseDateSweden(
        '2026-01-27T12:00:00.0000000+02:00'
    ).toISOString()
    const expected = '2026-01-27T11:00:00.000Z'
    expect(result).toStrictEqual(expected)
})

it('returns Invalid Date if the date format is invalid', () => {
    const result = parseDateSweden('Invalid date format')
    expect(result.getTime()).toBe(NaN)
})
