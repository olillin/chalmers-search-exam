import {
    exportedForTesting,
    type exportedTypesForTesting,
    ExamDateChange,
} from '../../src'
const { parseExamDateChange } = exportedForTesting
type RawExamDateChange = exportedTypesForTesting['RawExamDateChange']

const rawExamDateChange: RawExamDateChange = {
    __typename: 'PewExamdatesPewExamDateChange',
    changeCode: 'EX_DATE',
    changeId: 25502,
    oldValue: '2026-03-16',
    newValue: '2026-03-20',
    decisionDate: '2025-12-04T00:00:00',
    pressInfo: '[2026-03-16 4,5 hp, 0217]',
    signedBy: 'Examinator',
}

it('parses exam date changes correctly', () => {
    const result = parseExamDateChange(rawExamDateChange)
    const expected: ExamDateChange = {
        changeId: 25502,
        oldValue: new Date('2026-03-15T23:00:00.000Z'),
        newValue: new Date('2026-03-19T23:00:00.000Z'),
        decisionDate: new Date('2025-12-03T23:00:00.000Z'),
        pressInfo: '[2026-03-16 4,5 hp, 0217]',
        signedBy: 'Examinator',
    }
    expect(result).toStrictEqual(expected)
})
