import { Exam, ExamDateChange, ExamLocation } from './exam'

interface ExamSearchResponse {
    info: {
        /** How many items are in results. */
        count: number
        endCursor: number
        suggest: unknown
    }
    results: RawExam[]
}

interface RawExam {
    __typename: 'PewExamdates'
    /** The course name. */
    name: string
    /** When this exam was last updated. */
    updated: string
    /** The location of the exam, usually which Campus. */
    examsLoc: ExamLocation
    /** Start date for registering for the exam. */
    exDateRegStart: string
    /** End date for registering for the exam. */
    exDateLastReg: string
    /** Date for the exam. */
    exDate: string
    /** Start time for the exam as HH:MM. */
    starts: string
    /** Duration of the exam in hours. */
    exLenght: number
    /** Exam course code. */
    code: string
    /** If the exam is cancelled. */
    isCancelled: boolean
    /** The numeric identifier for the course. */
    courseId: number
    /** A list of date changes for this exam. */
    pewExamDateChanges: RawExamDateChange[]
    /** The identifier for the exam. */
    examId: string
    inst: number
    cmCode: string
    /** Which part of the exam this is, if there are multiple. */
    part: '' | (string & {})
    ordinal: number
    /** If the exam will be digital. */
    digitalDecided: number
}

interface RawExamDateChange {
    __typename: 'PewExamdatesPewExamDateChange'
    changeCode: 'EX_DATE'
    /** The numeric identifier for this change. */
    changeId: number
    /** Date for the exam before the change. */
    oldValue: string
    /** Date for the exam after the change. */
    newValue: string
    /** When this change was made. */
    decisionDate: string
    pressInfo: string
    signedBy: string
}

/**
 * Parse a date string with the Swedish time zone, optionally with a time of day.
 * @param date The date in ISO format.
 * @param time The time as HH:MM.
 * @returns The date at the time provided.
 */
function parseDateSweden(date: string, time?: string): Date {
    const dateSplit = date.split('T')
    const datePart = dateSplit[0]
    const timePart =
        time !== undefined ? time + ':00' : (dateSplit[1] ?? '00:00:00')
    const iso = `${datePart}T${timePart}`

    const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(new Date(iso))

    const get = (t: string) => parts.find(p => p.type === t)!.value

    return new Date(
        `${get('year')}-${get('month')}-${get('day')}T` +
            `${get('hour')}:${get('minute')}:${get('second')}`
    )
}

/**
 * Parse an exam date change from the API.
 * @param change The raw JSON exam date change from the API.
 * @returns The parsed exam date change.
 */
function parseExamDateChange(change: RawExamDateChange): ExamDateChange {
    return {
        changeId: change.changeId,
        oldValue: parseDateSweden(change.oldValue),
        newValue: parseDateSweden(change.newValue),
        decisionDate: parseDateSweden(change.decisionDate),
        pressInfo: change.pressInfo,
        signedBy: change.signedBy,
    }
}

const ONE_HOUR_MS = 60 * 60 * 1000

/**
 * Parse an exam from the API.
 * @param exam The raw JSON exam from the API.
 * @returns The parsed exam.
 */
function parseExam(exam: RawExam): Exam {
    const start = parseDateSweden(exam.exDate, exam.starts)
    const durationMs = exam.exLenght * ONE_HOUR_MS
    const end = new Date(start.getTime() + durationMs)

    return {
        id: exam.examId,
        name: exam.name,
        part: exam.part,

        location: exam.examsLoc,
        start: start,
        end: end,
        duration: exam.exLenght,
        isDigital: !!exam.digitalDecided,
        isCancelled: exam.isCancelled,

        registrationStart: parseDateSweden(exam.exDateRegStart),
        registrationEnd: parseDateSweden(exam.exDateLastReg),

        courseCode: exam.code,
        courseId: exam.courseId,

        updated: parseDateSweden(exam.updated),
        dateChanges: exam.pewExamDateChanges.map(parseExamDateChange),

        inst: exam.inst,
        cmCode: exam.cmCode,
        ordinal: exam.ordinal,
    }
}

/**
 * Search for an exam using the Chalmers API.
 *
 * If the query is a course code only exact matches for that course code will
 * be returned.
 * @param query The search query, for example a course code.
 * @returns The exams found for the query.
 */
export async function searchExam(query: string): Promise<Exam[]> {
    const variables = {
        filter: {
            _and: [
                {
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
                },
                {
                    _or: [],
                },
            ],
        },
        search: query,
        sort: [],
        indexes: 'PewExamdates',
        language: 'sv',
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
    const url = new URL('https://www.chalmers.se/api/list/')
    url.searchParams.append('variables', JSON.stringify(variables))

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(
            `Received error from API (code ${response.status}): ${await response.text()}`
        )
    }

    const responseData: ExamSearchResponse =
        (await response.json()) as ExamSearchResponse

    // Only include exact matches for the course code
    const exactMatches = responseData.results.filter(
        exam => exam.code.toUpperCase() === query.toUpperCase()
    )
    const rawExams =
        exactMatches.length > 0 ? exactMatches : responseData.results

    return rawExams.map(parseExam)
}

export const exportedForTesting = {
    parseExam,
    parseExamDateChange,
    parseDateSweden,
}
export type exportedTypesForTesting = {
    ExamSearchResponse: ExamSearchResponse
    RawExam: RawExam
    RawExamDateChange: RawExamDateChange
}
