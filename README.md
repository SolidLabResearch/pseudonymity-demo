<!-- omit in toc -->

# Evaluation

This repository contains resources necessary for evaluating the Solid DIF PoC.

---
Table of Contents

- [Evaluation](#evaluation)
    - [Usage](#usage)
    - [Testing](#testing)
    - [Background](#background)

## Prerequisites

- Docker Compose

## Usage

- [ ] TODO

## Testing

```bash
npm install
```

Run all tests with a single script as follows:

> Make sure that `collectCoverage` is set to `false` in [`jest.config.js`](./jest.config.js) when running all tests (`npm run test`), since Jest reports to `stderr`, which will break the subsequent npm scripts from executing.

```bash
npm run test
```

Otherwise,
the following sections demonstrate how to run
tests for components and use cases separately.

### Components

Run the tests as follows:

```bash
npm run test:components
```

To teardown the test infrastructure, execute:

```bash
npm run test:components:teardown
```

### Use cases

Run the tests as follows:

```bash
npm run test:usecases
```

To teardown the test infrastructure, execute:

```bash
npm run test:usecases:teardown
```

## Background

See [docs/solutions](docs/solutions.md).
