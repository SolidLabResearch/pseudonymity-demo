<!-- omit in toc -->

# Pseudonymity PoC

This repository contains an implementation for pseudonymity combining WebID and DID Key.

---
Table of Contents

- [Pseudonymity PoC](#pseudonymity-poc)
  - [Prerequisites](#prerequisites)
  - [Pseudonymity demo](#pseudonymity-demo)
  - [Testing](#testing)
  - [Use case](#use-case)
  - [License](#license)

## Prerequisites

- Docker Compose

## Pseudonymity demo

This demo executes the use case explained [here](#use-case).

> Before running the demo,
make sure that Docker and Docker Compose are installed.

To install this package, run:

```bash
npm install
```

Then, you can execute the demo:

```bash
npm run demo
```

During execution, intermediary outputs are written to the console output.
Upon completion, these raw outputs can be found in [`./pseudonymity-demo-output.json`](./pseudonymity-demo-output.json).
In [`demo-output-readme`](demo-output-readme.md), these outputs are explained.

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


## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
