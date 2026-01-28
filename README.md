# Chalmers Search Exam

[![GitHub test status](https://img.shields.io/github/check-runs/olillin/chalmers-search-exam/main?style=flat-square&label=build)](https://github.com/olillin/chalmers-search-exam/actions?query=branch%3Amain)
[![NPM Version](https://img.shields.io/npm/v/chalmers-search-exam?style=flat-square&logo=npm)](https://npmjs.com/package/chalmers-search-exam)

Library and CLI to search for your exam at Chalmers.

## Usage

The library only exports the `searchExam` function and some types. The function
takes a search query which is used with the Chalmers API to get a list of
exams. If the query is a course code then results for other course codes will
be filtered out.

See the example below:

```typescript
import { searchExam, Exam } from 'chalmers-search-exam'

async function printExamStart(courseCode: string) {
    const exams: Exam[] = await searchExam(courseCode)
    console.log(exams[0].start)
}

printExamStart('TDA553') // Output: 2026-03-19T13:00:00.000Z
```

## CLI

Chalmers Search Exam comes with a CLI which allows you to search for exams.

### Usage

The CLI is very simple and only has a single argument, the search query.

For example:

```console
$ cthexam TDA553

TDA553 Objektorienterad programmering och design Modul: 0122
Start:    Thu, 19 March 2026 at 14:00
Duration: 4 hours
Location: Johanneberg
Register: 29 Dec 2025 → 01 Mar 2026

TDA553 Objektorienterad programmering och design Modul: 0122
Start:    Wed, 10 June 2026 at 14:00
Duration: 4 hours
Location: Johanneberg
Register: 27 Apr 2026 → 25 May 2026

TDA553 Objektorienterad programmering och design Modul: 0122
Start:    Wed, 26 August 2026 at 14:00
Duration: 4 hours
Location: Johanneberg
Register: 06 Jul 2026 → 02 Aug 2026

```

Note that the CLI has colors which are not shown above.

### Installation

#### NPM

```console
npm install -g chalmers-search-exam
```

#### Nix Flakes

Add the flake input to your `flake.nix`:

```nix
{
  inputs.chalmers-search-exam = {
    url = "github:olillin/chalmers-search-exam";
    inputs.nixpkgs.follows = "nixpkgs";
  };
}
```

Add the package to `configuration.nix`:

```
{ inputs, stdenv, ... }:
{
  environment.systemPackages = [
    inputs.chalmers-search-exam.packages.${stdenv.system}.default
  ];
}
```

Rebuild your system, you can now use the `cthexam` command.
