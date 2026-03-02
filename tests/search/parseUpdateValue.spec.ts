import { exportedForTesting } from '../../src'
const { parseUpdateValue } = exportedForTesting

it('parses dates correctly', () => {
    const value = '2026-03-16'
    const result = parseUpdateValue(value)
    const expected = new Date('2026-03-15T23:00:00Z')
    expect(result).toStrictEqual(expected)
})

it('parses strings correctly', () => {
    const value = 'E'
    const result = parseUpdateValue(value)
    const expected = 'E'
    expect(result).toBe(expected)
})

it('parses integers correctly', () => {
    const value = '0'
    const result = parseUpdateValue(value)
    const expected = 0
    expect(result).toBe(expected)
})

it('parses decimals correctly', () => {
    const value = '1.5'
    const result = parseUpdateValue(value)
    const expected = 1.5
    expect(result).toBe(expected)
})
