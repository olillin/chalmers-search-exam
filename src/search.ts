import { Exam, ExamUpdate } from './exam'
import {
    ExamSearchResponse,
    RawExam,
    RawExamUpdate,
    parseExamSearchResponse,
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
 * Parse a value from an exam update and convert into an appropriate type.
 * @param value The value to parse.
 * @returns The parsed value as a date, number or string.
 */
function parseUpdateValue(value: string): string | Date | number {
    // Try parse number
    const num = Number(value)
    if (!isNaN(num)) {
        return num
    }

    // Try parse date
    const date = parseDateSweden(value)
    if (!isNaN(date.getTime())) {
        return date
    }

    // Fallback as string
    return value.toString()
}

/**
 * Parse an exam update from the API.
 * @param update The raw JSON exam update from the API.
 * @returns The parsed exam update.
 */
function parseExamUpdate(update: RawExamUpdate): ExamUpdate {
    return {
        id: update.changeId,
        updateType: update.changeCode,
        oldValue: parseUpdateValue(String(update.oldValue)),
        newValue: parseUpdateValue(String(update.newValue)),
        decisionDate: parseDateSweden(update.decisionDate),
        pressInfo: update.pressInfo,
        signedBy: update.signedBy,
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
        updates: exam.pewExamDateChanges.map(parseExamUpdate),

        inst: exam.inst,
        cmCode: exam.cmCode,
        ordinal: exam.ordinal,

        ...examTimes,
        ...registrationStart,
        ...registrationEnd,
    }
}

export type ExamSearchLanguage = 'sv' | 'en'
export interface ExamSearchOptions {
    /** The query which will be searched for. */
    query?: string
    /** The language for the search results, default is Swedish. */
    language?: ExamSearchLanguage

    /** Filter for exams which match all the set properties. */
    filter: {
        /** The identifier for the exam. */
        courseCode?: string
        /** Course code the exam is for. */
        courseName?: string
        /** The numeric identifier for the course. */
        courseId?: number
    }
}

type FilterOptions = {
    _and?: FilterOptions[]
    _or?: FilterOptions[]
} & {
    [key in keyof RawExam]?: {
        _eq?: string
        _gte?: string
        _lte?: string
    }
}

/**
 * Search for an exam using the Chalmers API.
 * @param options The search options. Will filter exams for exact matches only.
 * @returns The exams found with the search options.
 */
export async function searchExam(options: ExamSearchOptions): Promise<Exam[]>

/**
 * Search for an exam using the Chalmers API.
 * @param query The search query, for example a course code or name.
 * @returns The exams found for the query.
 */
export async function searchExam(query: string): Promise<Exam[]>
export async function searchExam(
    q: string | ExamSearchOptions
): Promise<Exam[]> {
    let url: URL
    if (typeof q === 'string') {
        const upperQuery = q.toUpperCase()
        if (isCourseCode(upperQuery)) {
            const filter: FilterOptions = {
                _and: [
                    defaultSearchFilter,
                    {
                        code: {
                            _eq: upperQuery,
                        },
                    },
                ],
            }
            url = createSearchUrl(q, filter)
        } else {
            url = createSearchUrl(q)
        }
    } else {
        const filter: FilterOptions = {
            _and: [
                defaultSearchFilter,
                q.filter.courseCode == null
                    ? {}
                    : {
                          code: {
                              _eq: q.filter.courseCode,
                          },
                      },
                q.filter.courseName == null
                    ? {}
                    : {
                          name: {
                              _eq: q.filter.courseName,
                          },
                      },
                q.filter.courseId == null
                    ? {}
                    : {
                          courseId: {
                              _eq: String(q.filter.courseId),
                          },
                      },
            ],
        }
        url = createSearchUrl(q.query, filter, q.language)
    }

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(
            `Received error from API (code ${response.status}): ${await response.text()}`
        )
    }

    const rawData: unknown = await response.json()
    const rawExams: RawExam[] = parseExamSearchResponse(rawData, {
        url: url.toString(),
    }).results

    const exams: Exam[] = rawExams.map(parseExam)
    return exams
}

/**
 * Checks if a string is a course code.
 * @param maybeCourseCode The string to check.
 * @returns If the string is a course code.
 */
export function isCourseCode(maybeCourseCode: string): boolean {
    const pattern = /^[A-Z]{3}[0-9]{3}(GU|_[0-9]{2}_[HV]T[0-9]{2}_[0-9]{5})?$/
    return pattern.test(maybeCourseCode)
}

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

interface SearchVariables {
    search?: string
    filter: FilterOptions
    language: ExamSearchLanguage
    sort: unknown[]
    indexes: string
    context: string
    highlight: boolean
    groupBy: string
    url: string[]
}

/**
 * Create the search variables for the Chalmers API with simpler options.
 * @param query The search query, may be omitted.
 * @param filter Options to filter exams by, will use a default filter if omitted.
 * @param language The language for the search results, default is Swedish.
 * @returns The constructed variables ready to be sent to the API.
 */
function createSearchVariables(
    query: string | null | undefined,
    filter?: FilterOptions | null,
    language?: ExamSearchLanguage | null
): SearchVariables {
    if (filter == null) {
        filter = defaultSearchFilter
    }
    return {
        ...(query != null ? { search: query } : undefined),
        filter,
        language: language ?? 'sv',
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
}

/**
 * Create the URL for the Chalmers API with simpler options.
 * @param query The search query, may be omitted.
 * @param filter Options to filter exams by, will use a default filter if omitted.
 * @param language The language for the search results, default is Swedish.
 * @returns The constructed URL ready to request the API.
 */
function createSearchUrl(
    query: string | null | undefined,
    filter?: FilterOptions | null,
    language?: ExamSearchLanguage | null
): URL {
    const url = new URL('https://www.chalmers.se/api/list')
    const variables = createSearchVariables(query, filter, language)
    url.searchParams.append('variables', JSON.stringify(variables))
    return url
}

export const exportedForTesting = {
    parseExam,
    parseExamUpdate,
    parseDateSweden,
    parseUpdateValue,
    createSearchVariables,
    createSearchUrl,
}
export type exportedTypesForTesting = {
    ExamSearchResponse: ExamSearchResponse
    RawExam: RawExam
    RawExamUpdate: RawExamUpdate
    FilterOptions: FilterOptions
    SearchVariables: SearchVariables
}
