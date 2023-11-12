# Problems

## Invalid JSON-LD syntax; tried to redefine "Ed25519Signature2018" which is a protected term

- Context: deriving VCs
- Caused by: `jsonld-signatures:11.2.0`
- Solution: downgrade to `jsonld-signatures:7.0.0` 

## ReferenceError: Buffer is not defined

- Context: running Jest tests
- Caused by: @transmute/did-key-bls12381
- Solution: getting rid of this dependency :)
