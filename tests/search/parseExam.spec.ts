import { Exam, exportedForTesting, exportedTypesForTesting } from '../../src'
const { parseExam, parseExamDateChange } = exportedForTesting
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

const expectedExamNoTime: Exam = {
    name: 'Objektorienterad programmering och design',
    updated: new Date('2026-01-27T11:00:00.000Z'),
    location: 'Johanneberg',
    registrationStart: new Date('2025-12-28T23:00:00.000Z'),
    registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
    courseCode: 'TDA553',
    isCancelled: false,
    courseId: 40337,
    dateChanges: [],
    id: 'norm_63294',
    inst: 0,
    cmCode: '0122',
    part: '',
    ordinal: 1,
    isDigital: false,
}

it('omits exam times if exDate is null', () => {
    const rawExamNoDate: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: '2025-12-29T00:00:00',
        exDateLastReg: '2026-03-01T00:00:00',
        exDate: null,
        starts: '14:00',
        exLenght: 4,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const result = parseExam(rawExamNoDate)
    expect(result).toStrictEqual(expectedExamNoTime)
})

it('omits exam times if starts is empty', () => {
    const rawExamEmptyStart: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: '2025-12-29T00:00:00',
        exDateLastReg: '2026-03-01T00:00:00',
        exDate: '2026-03-19T00:00:00',
        starts: '',
        exLenght: 4,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const result = parseExam(rawExamEmptyStart)
    expect(result).toStrictEqual(expectedExamNoTime)
})

it('omits registration start if null', () => {
    const rawExamNoRegStart: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: null,
        exDateLastReg: '2026-03-01T00:00:00',
        exDate: '2026-03-19T00:00:00',
        starts: '14:00',
        exLenght: 4,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const expected: Exam = {
        name: 'Objektorienterad programmering och design',
        updated: new Date('2026-01-27T11:00:00.000Z'),
        location: 'Johanneberg',
        registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
        start: new Date('2026-03-19T13:00:00.000Z'),
        end: new Date('2026-03-19T17:00:00.000Z'),
        duration: 4,
        courseCode: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        dateChanges: [],
        id: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        isDigital: false,
    }
    const result = parseExam(rawExamNoRegStart)
    expect(result).toStrictEqual(expected)
})

it('omits registration end if null', () => {
    const rawExamNoRegEnd: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: '2025-12-29T00:00:00',
        exDateLastReg: null,
        exDate: '2026-03-19T00:00:00',
        starts: '14:00',
        exLenght: 4,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const expected: Exam = {
        name: 'Objektorienterad programmering och design',
        updated: new Date('2026-01-27T11:00:00.000Z'),
        location: 'Johanneberg',
        registrationStart: new Date('2025-12-28T23:00:00.000Z'),
        start: new Date('2026-03-19T13:00:00.000Z'),
        end: new Date('2026-03-19T17:00:00.000Z'),
        duration: 4,
        courseCode: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        dateChanges: [],
        id: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        isDigital: false,
    }
    const result = parseExam(rawExamNoRegEnd)
    expect(result).toStrictEqual(expected)
})

it('correctly parses 0 hour long exams', () => {
    const rawExamZeroHours: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: '2025-12-29T00:00:00',
        exDateLastReg: '2026-03-01T00:00:00',
        exDate: '2026-03-19T00:00:00',
        starts: '14:00',
        exLenght: 0,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const expected: Exam = {
        name: 'Objektorienterad programmering och design',
        updated: new Date('2026-01-27T11:00:00.000Z'),
        location: 'Johanneberg',
        registrationStart: new Date('2025-12-28T23:00:00.000Z'),
        registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
        start: new Date('2026-03-19T13:00:00.000Z'),
        end: new Date('2026-03-19T13:00:00.000Z'),
        duration: 0,
        courseCode: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        dateChanges: [],
        id: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        isDigital: false,
    }
    const result = parseExam(rawExamZeroHours)
    expect(result).toStrictEqual(expected)
})

it('correctly parses decimal hour long exams', () => {
    const rawExamDecimalHours: RawExam = {
        __typename: 'PewExamdates',
        name: 'Objektorienterad programmering och design',
        updated: '2026-01-27T12:00:00.0000000+01:00',
        examsLoc: 'Johanneberg',
        exDateRegStart: '2025-12-29T00:00:00',
        exDateLastReg: '2026-03-01T00:00:00',
        exDate: '2026-03-19T00:00:00',
        starts: '14:00',
        exLenght: 2.5,
        code: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        pewExamDateChanges: [],
        examId: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        digitalDecided: 0,
    }
    const expected: Exam = {
        name: 'Objektorienterad programmering och design',
        updated: new Date('2026-01-27T11:00:00.000Z'),
        location: 'Johanneberg',
        registrationStart: new Date('2025-12-28T23:00:00.000Z'),
        registrationEnd: new Date('2026-02-28T23:00:00.000Z'),
        start: new Date('2026-03-19T13:00:00.000Z'),
        end: new Date('2026-03-19T15:30:00.000Z'),
        duration: 2.5,
        courseCode: 'TDA553',
        isCancelled: false,
        courseId: 40337,
        dateChanges: [],
        id: 'norm_63294',
        inst: 0,
        cmCode: '0122',
        part: '',
        ordinal: 1,
        isDigital: false,
    }
    const result = parseExam(rawExamDecimalHours)
    expect(result).toStrictEqual(expected)
})
