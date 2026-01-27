import {
    Exam,
    ExamDateChange,
    exportedForTesting,
    exportedTypesForTesting,
} from '../src'
const { parseExam, parseExamDateChange, parseDateSweden } = exportedForTesting
type RawExam = exportedTypesForTesting['RawExam']
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

const rawExam: RawExam = {
    __typename: 'PewExamdates',
    name: 'Objektorienterad programmering och design',
    updated: '2026-01-27T12:00:00.0000000+01:00',
    examsLoc: 'Johanneberg',
    exDateRegStart: '2025-12-29T00:00:00',
    exDateLastReg: '2026-03-01T00:00:00',
    exDate: '2026-03-19T00:00:00',
    starts: '14:00',
    exLenght: 4,
    code: 'TDA553',
    isCancelled: false,
    courseId: 40337,
    pewExamDateChanges: [rawExamDateChange],
    examId: 'norm_63294',
    inst: 0,
    cmCode: '0122',
    part: '',
    ordinal: 1,
    digitalDecided: 0,
}

describe('parseExam', () => {
    it('parses exams correctly', () => {
        const result = parseExam(rawExam)
        const expected: Exam = {
            name: 'Objektorienterad programmering och design',
            updated: new Date('2026-01-27T11:00:00.000Z'),
            location: 'Johanneberg',
            registrationStart: new Date('2025-12-28T23:00:00.000Z'),
            registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
            start: new Date('2026-03-19T13:00:00.000Z'),
            end: new Date('2026-03-19T17:00:00.000Z'),
            duration: 4,
            courseCode: 'TDA553',
            isCancelled: false,
            courseId: 40337,
            dateChanges: [parseExamDateChange(rawExamDateChange)],
            id: 'norm_63294',
            inst: 0,
            cmCode: '0122',
            part: '',
            ordinal: 1,
            isDigital: false,
        }
        expect(result).toStrictEqual(expected)
    })
})

describe('parseExamDateChange', () => {
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
})

describe('parseDateSweden', () => {
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
        const result = parseDateSweden(
            '2026-01-27T02:00:00',
            '08:30'
        ).toISOString()
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
})
