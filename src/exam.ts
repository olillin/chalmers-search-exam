export interface Exam {
    /** The identifier for the exam. */
    id: string
    /** The course name. */
    name: string
    /** Which part of the exam this is, if there are multiple. */
    part: '' | (string & {})

    /** The location of the exam, usually which Campus. */
    location: ExamLocation
    /** Start date and time for the exam. */
    start?: Date
    /** End date and time for the exam. */
    end?: Date
    /** Duration of the exam in hours. */
    duration?: number
    /** If the exam will be digital. */
    isDigital: boolean
    /** If the exam is cancelled. */
    isCancelled: boolean

    /** Start date for registering for the exam. */
    registrationStart?: Date
    /** End date for registering for the exam. */
    registrationEnd?: Date

    /** Course code the exam is for. */
    courseCode: string
    /** The numeric identifier for the course. */
    courseId: number

    /** When this exam was last updated. */
    updated: Date
    /** A list of date changes for this exam. */
    dateChanges: ExamDateChange[]

    inst: number
    cmCode: string
    ordinal: number
}

export type ExamLocation = 'Johanneberg' | 'Lindholmen' | (string & {})

export interface ExamDateChange {
    /** The numeric identifier for this change. */
    changeId: number
    /** Date for the exam before the change. */
    oldValue: Date
    /** Date for the exam after the change. */
    newValue: Date
    /** When this change was made. */
    decisionDate: Date
    pressInfo: string
    signedBy: string
}
