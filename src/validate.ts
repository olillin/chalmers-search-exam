import * as z from 'zod'
import util from 'util'

const RawExamDateChange = z.object({
    __typename: z.literal('PewExamdatesPewExamDateChange'),
    changeCode: z.literal('EX_DATE'),
    /** The numeric identifier for this change. */
    changeId: z.int().nonnegative(),
    /** Date for the exam before the change. */
    oldValue: z.iso.date(),
    /** Date for the exam after the change. */
    newValue: z.iso.date(),
    /** When this change was made. */
    decisionDate: z.iso.datetime({ local: true }),
    pressInfo: z.string(),
    signedBy: z.string(),
})

const RawExam = z.object({
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
    pewExamDateChanges: z.array(RawExamDateChange),
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

const ExamSearchResponse = z.object({
    info: z.object({
        /** How many items are in results. */
        count: z.int().nonnegative(),
        endCursor: z.int().nonnegative(),
        suggest: z.unknown(),
    }),
    results: z.array(RawExam),
})

export type ExamSearchResponse = z.infer<typeof ExamSearchResponse>
export type RawExamDateChange = z.infer<typeof RawExamDateChange>
export type RawExam = z.infer<typeof RawExam>

export interface ValidationIssue {
    code: string
    path: string
    message: string
}

export class ValidationError extends Error {
    issues: ValidationIssue[]
    data: unknown

    constructor(message: string, issues: ValidationIssue[], data: unknown) {
        super(message)
        this.issues = issues
        this.data = data
    }

    toJson() {
        return {
            name: this.name,
            message: this.message,
            issues: this.issues,
            data: this.data,
        }
    }


    override toString(): string {
        return util.inspect(this.toJson(), {
            depth: 5,
            maxArrayLength: 5,
            maxStringLength: 200,
            breakLength: 100,
            colors: true,
        })
    }
}

function getValidationIssues(error: z.ZodError): ValidationIssue[] {
    return error.issues.map(issue => ({
        code: issue.code,
        path: issue.path.join('.'),
        message: issue.message,
    }))
}

export function validateSearchResponse(data: unknown): ExamSearchResponse {
    try {
        return ExamSearchResponse.parse(data)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = getValidationIssues(error)
            throw new ValidationError(
                'Failed to validate search response',
                issues,
                data
            )
        } else throw error
    }
}
