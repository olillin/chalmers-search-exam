import * as z from 'zod'
import util from 'util'

export const RawExamUpdate = z.object({
    __typename: z.literal('PewExamdatesPewExamDateChange'),
    /** A code identifying what was changed. */
    changeCode: z.string(),
    /** The numeric identifier for this change. */
    changeId: z.int().nonnegative(),
    /** Value before the change. */
    oldValue: z.unknown(),
    /** Value after the change. */
    newValue: z.unknown(),
    /** When this change was made. */
    decisionDate: z.iso.datetime({ local: true }),
    pressInfo: z.string(),
    signedBy: z.string(),
})

export const RawExam = z.object({
    __typename: z.literal('PewExamdates'),
    /** The course name. */
    name: z.string(),
    /** When this exam was last updated. */
    updated: z.iso.datetime({ offset: true }),
    /** The location of the exam, usually which Campus. */
    examsLoc: z.string(),
    /** Start date for registering for the exam. */
    exDateRegStart: z.iso.datetime({ local: true }).nullable(),
    /** End date for registering for the exam. */
    exDateLastReg: z.iso.datetime({ local: true }).nullable(),
    /** Date for the exam. */
    exDate: z.iso.datetime({ local: true }).nullable(),
    /** Start time for the exam in ISO time format or an empty string. */
    starts: z.iso.time().or(z.literal('')),
    /** Duration of the exam in hours. */
    exLenght: z.number().nonnegative(),
    /** Exam course code. */
    code: z.string(),
    /** If the exam is cancelled. */
    isCancelled: z.boolean(),
    /** The numeric identifier for the course. */
    courseId: z.int().nonnegative(),
    /** A list of date changes for this exam. */
    pewExamDateChanges: z.array(RawExamUpdate),
    /** The identifier for the exam. */
    examId: z.string(),
    inst: z.int().nonnegative(),
    cmCode: z.string(),
    /** Which part of the exam this is, if there are multiple. */
    part: z.string().or(z.literal('')),
    ordinal: z.int().positive(),
    /** If the exam will be digital. */
    digitalDecided: z.int().nonnegative(),
})

export const ExamSearchResponse = z.object({
    info: z.object({
        /** How many items are in results. */
        count: z.int().nonnegative(),
        endCursor: z.int().nonnegative(),
        suggest: z.unknown(),
    }),
    results: z.array(RawExam),
})

export type ExamSearchResponse = z.infer<typeof ExamSearchResponse>
export type RawExamUpdate = z.infer<typeof RawExamUpdate>
export type RawExam = z.infer<typeof RawExam>

export interface ValidationIssue {
    code: string
    path: string
    message: string
}

export class ValidationError extends Error {
    issues: ValidationIssue[]
    data: unknown
    context: unknown

    constructor(message: string, issues: ValidationIssue[], data: unknown, context?: unknown) {
        super(message)
        this.issues = issues
        this.data = data
        this.context = context
    }

    toJson() {
        return {
            name: this.name,
            message: this.message,
            issues: this.issues,
            data: this.data,
            ...(this.context != undefined ? { context: this.context } : undefined)
        }
    }

    override toString(): string {
        return util.inspect(this.toJson(), {
            depth: 5,
            maxArrayLength: 5,
            breakLength: 100,
            colors: true,
        })
    }
}

/**
 * Get shorter validation issues from a Zod error.
 * @param error The error to get issues from.
 * @returns A list of validation issues.
 */
export function getValidationIssues(error: z.ZodError): ValidationIssue[] {
    return error.issues.map(issue => ({
        code: issue.code,
        path: issue.path.join('.'),
        message: issue.message,
    }))
}

/**
 * Parse unknown data as an exam search response.
 * @param data The unknown data to parse.
 * @param context Extra context to include if an error occurs.
 * @returns The parsed exam search response.
 * @throws {ValidationError} If the data is not a valid exam search response.
 */
export function parseExamSearchResponse(data: unknown, context?: unknown): ExamSearchResponse {
    try {
        return ExamSearchResponse.parse(data)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = getValidationIssues(error)
            throw new ValidationError(
                'Failed to validate search response',
                issues,
                data,
                context
            )
        } else throw error
    }
}
