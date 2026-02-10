#!/usr/bin/env node

import { Exam, searchExam } from '.'
import chalk from 'chalk'

/**
 * Format a date using the locale including both the date and time.
 * @param date The date to format.
 * @returns The formatted date and time.
 */
function formatDateAndTime(date: Date) {
    return date.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Format a date using the locale including only the date.
 * @param date The date to format.
 * @returns The formatted date.
 */
function formatDate(date: Date) {
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    })
}

/**
 * Create a terminal hyperlink.
 * @param url The URL the link leads to.
 * @param text The text shown for the link.
 * @returns The terminal compatible hyperlink.
 */
function link(url: string, text: string): string {
    return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`
}

/**
 * Get the URL to a course page.
 * @param courseCode The course to get the URL for.
 * @returns The URL to the course page.
 */
function getCourseUrl(courseCode: string): string {
    const base =
        'https://www.chalmers.se/utbildning/dina-studier/hitta-kurs-och-programplaner/kursplaner/'
    return base + courseCode
}

/**
 * Pretty print exam information.
 * @param exam The exam to print.
 */
function printExam(exam: Exam) {
    const url = getCourseUrl(exam.courseCode)
    const start = exam.start ? formatDateAndTime(exam.start) : 'Unknown'
    const duration =
        exam.duration !== undefined ? `${exam.duration} hours` : 'Unknown'

    const registrationStart = exam.registrationStart
        ? formatDate(exam.registrationStart)
        : null
    const registrationEnd = exam.registrationEnd
        ? formatDate(exam.registrationEnd)
        : null
    const registration =
        registrationStart !== null && registrationEnd !== null
            ? `${registrationStart} → ${registrationEnd}`
            : registrationStart === null && registrationEnd === null
              ? 'Unknown'
              : registrationStart !== null
                ? `From ${registrationStart}`
                : `Until ${registrationEnd}`

    const label = chalk.gray

    console.log(
        chalk.cyan.bold(link(url, `${exam.courseCode} ${exam.name}`)) +
            chalk.gray(` Modul: ${exam.cmCode}`)
    )
    console.log(label('Start:    ') + chalk.green(start))
    console.log(label('Duration: ') + chalk.magenta(duration))
    console.log(label('Location: ') + chalk.blue(exam.location))
    console.log(label('Register: ') + chalk.yellow(registration))
}

void (async function main() {
    const query = process.argv[2]
    if (query === undefined) {
        console.error('Usage: cthexam <query>')
        process.exit(1)
    }

    const exams = await searchExam(query)
    if (exams.length === 0) {
        console.log(chalk.yellow('No exams found'))
        process.exit(0)
    }

    exams.forEach((exam, i) => {
        if (i === 0) console.log()
        printExam(exam)
        console.log()
    })
})()
