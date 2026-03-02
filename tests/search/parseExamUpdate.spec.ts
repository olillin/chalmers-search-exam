import {
    exportedForTesting,
    type exportedTypesForTesting,
    ExamUpdate,
} from '../../src'
const { parseExamUpdate } = exportedForTesting
type RawExamUpdate = exportedTypesForTesting['RawExamUpdate']

it('parses update values', () => {
    const rawExamDateChange: RawExamUpdate = {
        __typename: 'PewExamdatesPewExamDateChange',
        changeCode: 'EX_DATE',
        changeId: 25502,
        oldValue: '2026-03-16',
        newValue: '2026-03-20',
        decisionDate: '2025-12-04T00:00:00',
        pressInfo: '[2026-03-16 4,5 hp, 0217]',
        signedBy: 'Examinator',
    }
    const result = parseExamUpdate(rawExamDateChange)
    const expected: ExamUpdate = {
        id: 25502,
        updateType: 'EX_DATE',
        oldValue: new Date('2026-03-15T23:00:00Z'),
        newValue: new Date('2026-03-19T23:00:00Z'),
        decisionDate: new Date('2025-12-03T23:00:00.000Z'),
        pressInfo: '[2026-03-16 4,5 hp, 0217]',
        signedBy: 'Examinator',
    }
    expect(result).toStrictEqual(expected)
})
