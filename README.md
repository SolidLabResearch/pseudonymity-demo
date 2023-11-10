<!-- omit in toc -->

# Evaluation

This repository contains resources necessary for evaluating the Solid DIF PoC.

---
Table of Contents

- [Evaluation](#evaluation)
    - [Usage](#usage)
    - [Testing](#testing)
    - [Background](#background)

## Usage

- [ ] TODO

## Testing

```bash
npm install
```

Before running the tests,
the test infrastructure (defined
in [`docker-compose.test.yml`](./docker-compose.test.yml)) needs to be set up,
as follows:

```bash
npm run docker:test:clean-start
```

When the previous command finished successfully,
run the tests as follows:

```bash
npm run test
```

To teardown the test infrastructure, execute:

```bash
npm run docker:test:stop
```

## Background

See [docs/solutions](docs/solutions.md).
