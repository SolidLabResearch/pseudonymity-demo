<!-- omit in toc -->
# Problems

- [Using a WebID as controller does not work \[OPEN\]](#using-a-webid-as-controller-does-not-work-open)
- [Invalid JSON-LD syntax; tried to redefine "Ed25519Signature2018" which is a protected term](#invalid-json-ld-syntax-tried-to-redefine-ed25519signature2018-which-is-a-protected-term)
- [ReferenceError: Buffer is not defined](#referenceerror-buffer-is-not-defined)

## [OPEN] Using a WebID as controller does not work 

### Current solution state

- Alice's controller document is serialized to N-QUADS, and resolvable at `http://localhost:3000/alice/dids/controller`
- `DocumentLoader` is updated by supporting the parsing  of `application/n-quads`.
  - (Response) -> text document with n-quads -> (N3.Parser) -> quadstore -> (`jsonld.fromRDF`) -> json-ld document 
- 

### Background

#### VC-DATA-INTEGRITY spec 

[4.7 Retrieve Verification Method](https://www.w3.org/TR/vc-data-integrity/#retrieve-verification-method)
describes the algorithm to retrieve a verification method using the verification method identifier contained
in a data integrity proof.

- `vmIdentifier = proof.verificationMethod`
- `controllerDocumentUrl` is the result of parsing `vmIdentifier` and extracting the **primary resource identifier** (without the fragment identifier)
- `controllerDocument = dereference(controllerDocumentUrl, options)`

## [OPEN] Ability to not disclose credentialSubject.id

- Context: deriving VCs
- Library:  `@mattrglobal/jsonld-signatures-bbs": "^1.2.0"`
- Problem: currently it is not possible to **not** disclose `credentialSubject.id`.
- Impact on business logic: currently, use cases that require hiding a subject's identifier cannot be implemented. For example, a holder cannot hide a base credential's `credentialSubject.id`.

## [SOLVED] Invalid JSON-LD syntax; tried to redefine "Ed25519Signature2018" which is a protected term

- Context: deriving VCs
- Caused by: `jsonld-signatures:11.2.0`
- Solution: downgrade to `jsonld-signatures:7.0.0` 

## [SOLVED] ReferenceError: Buffer is not defined

- Context: running Jest tests
- Caused by: @transmute/did-key-bls12381
- Solution: getting rid of this dependency :)
