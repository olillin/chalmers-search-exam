import { exportedForTesting, exportedTypesForTesting } from '../../src'
const { createSearchUrl } = exportedForTesting
type SearchVariables = exportedTypesForTesting['SearchVariables']

it('starts with https://www.chalmers.se/api/list?', () => {
    const pattern = /^https:\/\/www\.chalmers\.se\/api\/list\?/
    const url = createSearchUrl('foo')
    expect(url.toString()).toMatch(pattern)
})

it('passes all arguments to createSearchVariables', () => {
    const url = createSearchUrl('foo', { code: { _eq: 'spam' } }, 'en')
    const rawVariables = url.searchParams.get('variables')
    expect(rawVariables).not.toBeNull()

    const variables: unknown = JSON.parse(rawVariables!)

    const expectedVariables: SearchVariables = {
        search: 'foo',
        filter: { code: { _eq: 'spam' } },
        language: 'en',
        sort: [],
        indexes: 'PewExamdates',
        context: 'Tentamen',
        highlight: false,
        groupBy: 'collapse',
        url: [
            'utbildning',
            'dina-studier',
            'tentamen-och-ovrig-examination',
            'sok-tentamensdatum',
        ],
    }
    expect(variables).toStrictEqual(expectedVariables)
})
