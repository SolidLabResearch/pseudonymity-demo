<!-- omit in toc -->
# README

- [Overview](#overview)
- [Components](#components)
  - [`ActorSteps`](#actorsteps)
  - [`CredentialResources`](#credentialresources)
  - [`MultiActorEvaluator`](#multiactorevaluator)

## Overview

The script [`index.ts`](index.ts) simulates the pseudonymous job application use case.

The use case steps are defined in [`ActorSteps`](#actorsteps).
These steps are then instantiated and executed by the [`MultiActorEvaluator`](#multiactorevaluator).
The execution of each step is tracked (e.g., execution time, actor implementation, and produced output).
Finally, these step records are combined in a report and saved as a JSON file (`pseudonymity-demo-output.json`).

## Components

### `ActorSteps`

Credential Creation and Signing Functions:

- `createDiplomaCredential`
- `signDiplomaCredential`
- `createIdentityCredential`
- `createIdentityLinkingCredentials`
- `signIdentityCredential`
- `deriveDiplomaCredential`
- `deriveIdentityCredential`

Presentation Creation, Signing, and Verification Functions:

- `createPresentation01`
- `signPresentation01`
- `verifyPresentation01`
- `createPresentation02`
- `signPresentation02`
- `verifyPresentation02`

### `CredentialResources`

Defines a set of credential resources that are part of the use case.

### `MultiActorEvaluator`

Function `createActorSteps = (actors: IUseCaseActorsSetup) : IActorStep[]` is used to instantiate the use case steps a particular actor implementation.
For example, the following excerpt contains the sequence of steps (and corresponding actor) that represent the pseudonymous job application use case.

```ts
{actor: university, f: ActorSteps.createDiplomaCredential},
{actor: university, f: ActorSteps.signDiplomaCredential},
{actor: government, f: ActorSteps.createIdentityCredential},
{actor: government, f: ActorSteps.signIdentityCredential},

{actor: holder, mode: 'pseudo', f: ActorSteps.deriveDiplomaCredential},
{actor: holder, mode: 'pseudo', f: ActorSteps.createPresentation01},
{actor: holder, mode: 'pseudo', f: ActorSteps.signPresentation01},

{actor: recruiter, f: ActorSteps.verifyPresentation01},

{actor: holder, mode: 'public', f: ActorSteps.deriveIdentityCredential},
{actor: holder, mode: 'public', f: ActorSteps.createPresentation02},
{actor: holder, mode: 'public', f: ActorSteps.signPresentation02},

{actor: recruiter, f: ActorSteps.verifyPresentation02},
```

Function `evaluate(actorSteps: Array<IActorStep>): Promise<IMultiActorReport>` executes, monitors, and records the given `actorSteps`.
