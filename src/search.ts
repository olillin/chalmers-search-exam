import { Exam, ExamDateChange } from './exam'
import {
    ExamSearchResponse,
    RawExam,
    RawExamDateChange,
    validateSearchResponse,
} from './validate'

/**
 * Parse a date string with the Swedish time zone, optionally with a time of day.
 * @param date The date in ISO format.
 * @param time The time in ISO format.
 * @returns The date at the time provided.
 */
function parseDateSweden(date: string, time?: string): Date {
    const dateSplit = date.split(/[T+]/g)
    const datePart = dateSplit[0]
    const timePart = time !== undefined ? time : (dateSplit[1] ?? '00:00')
    const iso = `${datePart}T${timePart}`

    if (isNaN(new Date(iso).getTime())) {
        return new Date('Invalid date')
    }

    const swedenOffset =
        new Date(
            new Intl.DateTimeFormat('sv-SE', {
                timeZone: 'Europe/Stockholm',
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).format(new Date(iso))
        ).getTime() - new Date(iso).getTime()

    return new Date(new Date(iso).getTime() - swedenOffset)
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
    // Parse exam start, end and duration
    let examTimes: { start: Date; end: Date; duration: number } | null = null
    if (exam.exDate !== null && exam.starts !== '') {
        const start = parseDateSweden(exam.exDate, exam.starts)
        const durationMs = exam.exLenght * ONE_HOUR_MS
        const end = new Date(start.getTime() + durationMs)
        examTimes = {
            start: start,
            end: end,
            duration: exam.exLenght,
        }
    }

    // Parse registration start
    let registrationStart: { registrationStart: Date } | null = null
    if (exam.exDateRegStart !== null) {
        const date = parseDateSweden(exam.exDateRegStart)
        registrationStart = { registrationStart: date }
    }

    // Parse registration end
    let registrationEnd: { registrationEnd: Date } | null = null
    if (exam.exDateLastReg !== null) {
        const date = parseDateSweden(exam.exDateLastReg)
        registrationEnd = { registrationEnd: date }
    }

    // Parse exam registration start and end

    return {
        id: exam.examId,
        name: exam.name,
        part: exam.part,

        location: exam.examsLoc,
        isDigital: !!exam.digitalDecided,
        isCancelled: exam.isCancelled,

        courseCode: exam.code,
        courseId: exam.courseId,

        updated: parseDateSweden(exam.updated),
        dateChanges: exam.pewExamDateChanges.map(parseExamDateChange),

        inst: exam.inst,
        cmCode: exam.cmCode,
        ordinal: exam.ordinal,

        ...examTimes,
        ...registrationStart,
        ...registrationEnd,
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

    const rawData = await response.json()
    const responseData = validateSearchResponse(rawData)

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
