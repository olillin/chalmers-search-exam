import { isCourseCode } from '../../src'
import path from 'node:path'
import fs from 'node:fs/promises'

const codesFile = path.join(__dirname, 'resources/codes.txt')
const namesFile = path.join(__dirname, 'resources/names.txt')

const readLines = async (filename: string): Promise<string[]> => {
    return fs
        .readFile(filename, { encoding: 'utf8' })
        .then(content => content.split('\n').filter(line => line !== ''))
}

it('does not match lowercase course codes', () => {
    expect(isCourseCode('dat017')).toBe(false)
})

it('matches all codes in codes.txt', async () => {
    const codes = await readLines(codesFile)
    const incorrect = codes.filter(code => !isCourseCode(code))
    expect(incorrect).toStrictEqual([])
})

it('does not match any names in names.txt', async () => {
    const names = await readLines(namesFile)
    const incorrect = names.filter(name => isCourseCode(name))
    expect(incorrect).toStrictEqual([])
})

it('does not match any words in names.txt', async () => {
    const names = await readLines(namesFile)
    const incorrect = names.flatMap(name =>
        name.split(' ').filter(word => isCourseCode(word))
    )
    expect(incorrect).toStrictEqual([])
})
