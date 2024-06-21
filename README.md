<!-- omit in toc -->

# Evaluation

This repository contains an implementation for pseudonymity combining WebID and DID Key.

---
Table of Contents

- [Evaluation](#evaluation)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Testing](#testing)
  - [Use case](#use-case)
    - [Implementations](#implementations)
    - [Running the use case implementations](#running-the-use-case-implementations)
  - [Background](#background)
  - [License](#license)

## Prerequisites

- Docker Compose

## Install

Install the package as follows:

```bash
npm install
```

## Testing

Once [installed](#install),
you can run the test suite as follows:

```bash
npm run test
```

## Use case

The use case is as follows:

> Alice's government
has been a key player in the transformation to a new and user-centric data economy,
providing its citizens with their own Solid Pod on which they can securely store and share their personal data such as their payslips, bills, diplomas, notary documents, etc.
Alice (the holder) is interested in a particular job.
However, the job is known to suffer from a bias towards men.
The recruiter (the verifier) is aware of the bias and, therefore, does not require any other verifiable information than the applicant’s diploma.
However, Alice does not want to apply using the public identifier (e.g. 
<https://id.flanders.be/Alice>) linked to her Solid Pod,
as the identifier still allows for discovering more information than she would like to.
Hence, to reduce any bias in the selection procedure, Alice wants to apply for a job pseudonymously.
> This allows Alice to hide her real identity up until the HR department closes the job application round.
When Alice’s pseudonymous identity has been selected, she can then prove that her public identifier is bound to that pseudonymous identifier.

### Implementations

We provide two implementations in which a pseudonymous identity can established:

1. Using a WebID (label: `webid`)
2. Using a DID Key (label: `did-key`)

### Running the use case implementations

Run a specific use case implementation as follows:

```bash
./uc-runner.sh [-s did-key|webid] [-n <nr of iterations>] [-d <dlco config>] 
# E.g. ./uc-runner.sh -s did-key
```

Arguments:

- `-d`: (Optional) Document Loader Cache Option (0,1,2, or 3; cfr. [`src/profiling/config.ts`](src/profiling/config.ts) for details) (default: 3).
- `-n`: (Optional) Number of iterations (default: 1).
- `-s`: (Optional) Implementation to execute (default: ALL). Possible values: "ALL|webid|did-key".

> Execution time of the interactions is profiled across different actors.
The actors differ in how they manage and use their identity.
Logs are recorded in `reports/profiling`.

## Background

See [docs/solutions](docs/solutions.md).

## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).