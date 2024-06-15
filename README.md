<!-- omit in toc -->

# Evaluation

This repository contains resources necessary for evaluating the Solid DIF PoC.

---
Table of Contents

- [Evaluation](#evaluation)
  - [Prerequisites](#prerequisites)
  - [Usage](#usage)
  - [Testing](#testing)
    - [Components](#components)
    - [Use cases](#use-cases)
  - [Profiling](#profiling)
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

## Profiling

Execution time of the interactions is profiled across different actors.
The actors differ in how they manage and use their identity.

The evaluation workflow consists of the following steps:

1. Run the profiler, as follows:

    ```bash
    ./profiler.sh
    ```
    This will execute different implementations and generate log records in `reports/`.

2. Generate the profiling report using the [`profiling-report.ipynb`](./profiling-report.ipynb)-notebook.</br> This will generate several aggregate statistics and export them to `reports/profiling/nb`.


## Background

See [docs/solutions](docs/solutions.md).
