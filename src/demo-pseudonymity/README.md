<!-- omit in toc -->
# README

WebIDs are a Semantic Web technology for decentralized digital identities,
aiming to empower users with an autonomous digital
existence where privacy and control are key.
Pseudonymity is an important privacy protection tool.
However, WebIDs are not entirely within the control of its user and rely on other parties (e.g., DNS registry).

As such, WebIDs pose difficulties in scenarios where pseudonymity is required.
In this demo paper, we present a pseudonymity WebID solution based on open Web standards, allowing a user to autonomously create and use a pseudonymous identity and prove the binding between its actual and pseudonymous identity when needed.
We present a PoC implementation leveraging DID Key to establish a pseudonymous identity and Verifiable Credentials to prove the binding between the actual and pseudonymous identities.
We demonstrate our solution through a job application use case where a user can remain pseudonymous during the job selection procedure and, upon selection, prove the binding with its actual identity.
Hence, by combining WebIDs, DIDs, and Verifiable Credentials, we allow users to establish a pseudonymous identity without relying on third parties.
For future work, we will focus on our solutions' security and privacy considerations to provide a qualitative evaluation.

## Demonstrator

This demonstrator consists of a PoC implementation for pseudonymity combining WebID and DID Key.
Concretely,
the demonstrator code simulates a [use case about pseudonymous job application](#use-case).
An example of the outputs generated by the demonstrator can be found in [`./pseudonymity-demo-output.json`](./pseudonymity-demo-output.json) and [`demo-output-readme`](demo-output-readme.md) (where the outputs are explained).

The script [`index.ts`](./index.ts) simulates [the pseudonymous job application use case](#use-case).
Details about demonstrator code are explained [here](#components).

### Use Case

Alice's government
has been a key player in the transformation to a new and user-centric data economy,
providing its citizens with their own Solid Pod on which they can securely store and share their personal data such as their payslips, bills, diplomas, notary documents, etc.
Alice (the holder) is interested in a particular job.
However, the job is known to suffer from a bias towards men.
The recruiter (the verifier) is aware of the bias and, therefore, does not require any other verifiable information than the applicant’s diploma.
However, Alice does not want to apply using her public WebID,
as the identifier still allows for discovering more information than she would like to.
Hence, to reduce any bias in the selection procedure, Alice wants to apply for a job pseudonymously.
This allows Alice to hide her real identity up until the HR department closes the job application round.
When Alice’s pseudonymous identity has been selected, she can then prove that her public identifier is bound to that pseudonymous identifier.

### Running the demonstrator

Make sure to first install this package, as described in the [README of the repository root](../../README.md).

Run the demonstrator by executing the following NPM script from the repository root:

```bash
# @ REPO_ROOT
npm run demo
```

### Components

The use case steps are defined in [`ActorSteps`](#actorsteps).
These steps are then instantiated and executed by the [`MultiActorEvaluator`](#multiactorevaluator).
The execution of each step is tracked (e.g., execution time, actor implementation, and produced output).
Finally, these step records are combined in a report and saved as a JSON file (`pseudonymity-demo-output.json`).

#### `ActorSteps`

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

#### `CredentialResources`

Defines a set of credential resources that are part of the use case.

#### `MultiActorEvaluator`

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

## License

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).