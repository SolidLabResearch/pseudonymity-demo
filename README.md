<!-- omit in toc -->
# Pseudonymity PoC

This repository contains an implementation for pseudonymity combining WebID and DID Key.

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Testing](#testing)
  - [Implementations](#implementations)
  - [Running the use case implementations](#running-the-use-case-implementations)
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

## License

This code is copyrighted by [Ghent University – imec](#anon)
and released under the [MIT license](http://opensource.org/licenses/MIT).
