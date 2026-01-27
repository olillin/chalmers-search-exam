#!/usr/bin/env node

import { Exam, searchExam } from "."
import chalk from 'chalk'

function printExam(exam: Exam) {
  console.log(chalk.cyan(`${exam.courseCode} ${exam.name} (Modul: ${exam.cmCode})`))
  console.log(chalk.yellow(`Start: ${exam.start}`))
  console.log(chalk.yellow(`Duration: ${exam.duration} hours`))
  console.log(chalk.yellow(`Location: ${exam.location}`))
  console.log(chalk.yellow(`Registration: ${exam.registrationStart} - ${exam.registrationEnd}`))
}

;(async function main() {
  const query = process.argv[2]
  if (query === undefined) {
	  console.error("Usage: cthexam <query>")
	  process.exit(1)
  }

  const exams = await searchExam(query)
  if (exams.length === 0) {
    console.log(chalk.yellow("No exams found"))
    process.exit(0)
  }

  exams.forEach(printExam)
})()
