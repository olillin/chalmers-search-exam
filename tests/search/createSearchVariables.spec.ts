import { exportedForTesting, exportedTypesForTesting } from '../../src'
const { createSearchVariables } = exportedForTesting
type FilterOptions = exportedTypesForTesting['FilterOptions']

const defaultSearchFilter: FilterOptions = {
    _or: [
        {
            exDate: {
                _gte: 'now/d',
            },
        },
        {
            inst: {
                _eq: '1',
            },
        },
    ],
}

it("uses query as 'search' if set", () => {
    const variables = createSearchVariables('')
    expect(variables.search).toBe('')
})

it("omits 'search' if query is null", () => {
    const variables = createSearchVariables(null)
    expect(variables).not.toHaveProperty('search')
})

it("omits 'search' if query is undefined", () => {
    const variables = createSearchVariables(undefined)
    expect(variables).not.toHaveProperty('search')
})

it('uses filter if set', () => {
    const variables = createSearchVariables(null, {})
    expect(variables.filter).toStrictEqual({})
})

it('uses default filter if filter is null', () => {
    const variables = createSearchVariables(null, null)
    expect(variables.filter).toStrictEqual(defaultSearchFilter)
})

it('uses default filter if filter is undefined', () => {
    const variables = createSearchVariables(null, undefined)
    expect(variables.filter).toStrictEqual(defaultSearchFilter)
})

it('uses language if set', () => {
    const variables = createSearchVariables(null, null, 'en')
    expect(variables.language).toBe('en')
})

it("uses 'sv' if language is null", () => {
    const variables = createSearchVariables(null, null, null)
    expect(variables.language).toBe('sv')
})

it("uses 'sv' if language is undefined", () => {
    const variables = createSearchVariables(null, null, undefined)
    expect(variables.language).toBe('sv')
})

it("sets 'sort' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.sort).toStrictEqual([])
})

it("sets 'indexes' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.indexes).toBe('PewExamdates')
})

it("sets 'context' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.context).toBe('Tentamen')
})

it("sets 'highlight' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.highlight).toBe(false)
})

it("sets 'groupBy' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.groupBy).toBe('collapse')
})

it("sets 'url' correctly", () => {
    const variables = createSearchVariables(null)
    expect(variables.url).toStrictEqual([
        'utbildning',
        'dina-studier',
        'tentamen-och-ovrig-examination',
        'sok-tentamensdatum',
    ])
})
