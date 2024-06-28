# README 

## signDiplomaCredential 


University issues a Diploma credential to Alice, with the following contents:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/citizenship/v1"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "issuer": "http://localhost:3003/university/profile/card#me",
  "credentialSubject": {
    "id": "urn:test:id000",
    "identifier": "123456789ab",
    "ex:degreeTitle": "Msc. Physics",
    "ex:grade": "789/1000"
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-28T13:49:13Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "r1fclhLwITjWAUD/1zjJ7vQeMAyMGL+vQBRKuB/er7mxTse3tRk4dlRDLiNCPq2NYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==",
    "verificationMethod": "http://localhost:3003/university/profile/card#key"
  }
}
```
## signIdentityCredential 


Government issues an Identity credential to Alice, with the following contents:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/citizenship/v1"
  ],
  "type": [
    "VerifiableCredential"
  ],
  "issuer": "http://localhost:3004/government/profile/card#me",
  "credentialSubject": {
    "id": "urn:test:id000",
    "type": [
      "PermanentResident",
      "Person"
    ],
    "identifier": "123456789ab",
    "givenName": "Alice",
    "familyName": "Doe",
    "solid:webid": "http://localhost:3000/alice/profile/card#me"
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-28T13:49:14Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "mCMGiGkwkMZ0SXotSU72/8YicmmyfU9pb+xRAzs51lIARlcWoE7AAPXVb7IyFVSSMKVg9X44OT7IyqxonIH7xLuNJjBkG7KYma9urLMBCo4x5JoTWPaG1p7URXapIpy1ng+avITVXJin9XQoxPxyNA==",
    "verificationMethod": "http://localhost:3004/government/profile/card#key"
  }
}
```
## deriveDiplomaCredential 


Alice derives her diploma credential, only disclosing attributes required by the recruiter.

The derived credential has the following contents:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/citizenship/v1"
  ],
  "id": "urn:bnid:_:c14n0",
  "type": "VerifiableCredential",
  "credentialSubject": {
    "id": "urn:test:id000",
    "ex:degreeTitle": "Msc. Physics"
  },
  "issuer": "http://localhost:3003/university/profile/card#me",
  "proof": {
    "type": "BbsBlsSignatureProof2020",
    "created": "2024-06-28T13:49:13Z",
    "nonce": "AhSkxLPKA5M1sxragUu+H0Bzzgvor8St9NtaHYT4VzaJjz4pihGM760cNu6G02bHU1A=",
    "proofPurpose": "assertionMethod",
    "proofValue": "AAoDn61eTuRmu20K99K8QVW0eDQ4K4pH6JCYGMU3Q+YxJyTnnBOUNGScDQJzqI4KhVSWN5FKS429dr4OzhxM5G6wYy5xkcAFY0vs+0ZJ7Fp1PVSbDn9YERPmIHlV60h6Xci9mYBz5tAZexkU1HnXY4BCKLZG6VmQmhrnNLylxpjk2RwVLdhNfOUQwCLzWZaZt0I4WwAAAHS1lpcZ6MDqmXX2bf/rVbdCosKcqBujo8TbrA5yQOWdA6YiN4mipI6IQCjEA090WZoAAAACTmBpik2Lp7lD81n3K416NFQd/yviZaR0n3j1CfGiD34HYssW/TnxW2YsAshCogUYh5oLGqw9LPBZiNmyxKrsqqqFmSu4VEdL1wPCVZ852ma4Hn/k5iypUFkPsYAgnXt6Q+r+VvzkqWJUVJDyKmrVugAAAARnn+Q6QgtubaTadTzsc+hSSsmyBGOxH3igYdcFuOn06h1F63BM8hmtEMT8pVVTyD0HpztBs6zgq7G6ACM7cctUaGucvepLCmzqFq/fvr0TUUvwO9o0uxvRDOH3Sc9FocsO/GY8cyKWfRhIA0o1eREUaFWG1fHeZFLsaH9QSofKUA==",
    "verificationMethod": "http://localhost:3003/university/profile/card#key"
  }
}
```
## signPresentation01 


Alice creates a VP01 with the derived diploma credential,
and signs it using her pseudonymous identity.
Thus, as part of the diploma verification, Alice will pseudonymously present the following VP to the recruiter:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "type": [
    "VerifiablePresentation"
  ],
  "holder": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe",
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/citizenship/v1"
      ],
      "id": "urn:bnid:_:c14n0",
      "type": "VerifiableCredential",
      "credentialSubject": {
        "id": "urn:test:id000",
        "ex:degreeTitle": "Msc. Physics"
      },
      "issuer": "http://localhost:3003/university/profile/card#me",
      "proof": {
        "type": "BbsBlsSignatureProof2020",
        "created": "2024-06-28T13:49:13Z",
        "nonce": "AhSkxLPKA5M1sxragUu+H0Bzzgvor8St9NtaHYT4VzaJjz4pihGM760cNu6G02bHU1A=",
        "proofPurpose": "assertionMethod",
        "proofValue": "AAoDn61eTuRmu20K99K8QVW0eDQ4K4pH6JCYGMU3Q+YxJyTnnBOUNGScDQJzqI4KhVSWN5FKS429dr4OzhxM5G6wYy5xkcAFY0vs+0ZJ7Fp1PVSbDn9YERPmIHlV60h6Xci9mYBz5tAZexkU1HnXY4BCKLZG6VmQmhrnNLylxpjk2RwVLdhNfOUQwCLzWZaZt0I4WwAAAHS1lpcZ6MDqmXX2bf/rVbdCosKcqBujo8TbrA5yQOWdA6YiN4mipI6IQCjEA090WZoAAAACTmBpik2Lp7lD81n3K416NFQd/yviZaR0n3j1CfGiD34HYssW/TnxW2YsAshCogUYh5oLGqw9LPBZiNmyxKrsqqqFmSu4VEdL1wPCVZ852ma4Hn/k5iypUFkPsYAgnXt6Q+r+VvzkqWJUVJDyKmrVugAAAARnn+Q6QgtubaTadTzsc+hSSsmyBGOxH3igYdcFuOn06h1F63BM8hmtEMT8pVVTyD0HpztBs6zgq7G6ACM7cctUaGucvepLCmzqFq/fvr0TUUvwO9o0uxvRDOH3Sc9FocsO/GY8cyKWfRhIA0o1eREUaFWG1fHeZFLsaH9QSofKUA==",
        "verificationMethod": "http://localhost:3003/university/profile/card#key"
      }
    }
  ],
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-28T13:49:15Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "qraQ/bLUPEmmSueB+UrTf6X3sm5VongfvIOU1NASoRVEu4kSUacxC9qV3yXsh0sbJ11Jnv3EWamCZATkLRzCvrMF94q/GCjPp7EMm1zp12dzQqEElOgNk4tEUmAgmqNHzUQEJsCEe3+tWNDHb1xUYg==",
    "verificationMethod": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe#zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe"
  }
}
```
## verifyPresentation01 


The recruiter verifies VP01.
The verification result is as follows:

```json
{
  "verified": true,
  "results": [
    {
      "proof": {
        "@context": "https://w3id.org/security/v2",
        "type": "sec:BbsBlsSignature2020",
        "created": "2024-06-28T13:49:15Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "qraQ/bLUPEmmSueB+UrTf6X3sm5VongfvIOU1NASoRVEu4kSUacxC9qV3yXsh0sbJ11Jnv3EWamCZATkLRzCvrMF94q/GCjPp7EMm1zp12dzQqEElOgNk4tEUmAgmqNHzUQEJsCEe3+tWNDHb1xUYg==",
        "verificationMethod": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe#zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe"
      },
      "verified": true
    }
  ]
}
```
## Assumption: Alice passes selection round 

The recruiter verified VP01 and selects the corresponding holder as the best candidate for the job.
Therefore, the second phase (i.e., identity verification) starts, in which the holder needs to disclose
their actual identity.

## deriveIdentityCredential 


Alice derives her identity credential, only disclosing her WebID that was issued by the government.
The derived credential has the following contents:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1",
    "https://w3id.org/citizenship/v1"
  ],
  "id": "urn:bnid:_:c14n0",
  "type": "VerifiableCredential",
  "credentialSubject": {
    "id": "urn:test:id000",
    "type": [
      "Person",
      "PermanentResident"
    ],
    "solid:webid": "http://localhost:3000/alice/profile/card#me"
  },
  "issuer": "http://localhost:3004/government/profile/card#me",
  "proof": {
    "type": "BbsBlsSignatureProof2020",
    "created": "2024-06-28T13:49:14Z",
    "nonce": "Pz+E2w4CLnrYJk47B2MhjqQN/6bXohTwcmxHVvq6erVAjFUHreZ+fKETZDVboHsZfWo=",
    "proofPurpose": "assertionMethod",
    "proofValue": "AA0fj6qu5j/wNcn2yXyU7fgeOln7NN4JSt6Fcw402OGosWmriPUKvx6zS0aVsnvxmupWi5kwJehVD4kC+3CS8LkEcFRLX7ZIHd6TtLCc5672ShLiwUzSwH6GfbfKj3SA6bQDpo2YRDbqCgrQUITOXPApwsWkNx0OimxqRm1xiTJV1hXxAFKA2DyeINDD9vkGojB7NAAAAHShXaCA4EFHcl4soeCk7QF7pdIBQJjUyLShps1PHj+G37QO3hRHjC7lEh1/H0Bud5cAAAACJk9ecDOJVt+Ds08wdDocpufg6BQ7GxmRum0XNeIhbJsLjYQp5wDNzO1V9EcuN4XXbMdzvbOsb33XoRzbvTwKALfyuez4zmDtYI15ugi5Lz5Gv1PWc8yAPVc2CsclzwRQiL0QSti3VIlOzXO017c/9QAAAAUIV6bnBmIYKEIsRtPTY+9mMW8EFjHMrGsLBADZIHfoo0H/RFULWrQSdnh6iZ7pV3l+cZ0/x63XCsgSsspjsyCSbJXOX57EPid0oldSRrHXMre+O7gxC4etLZ6AvIjJIIkAGa+6aqh+AJyEOxSenyRd6UMH6XQqMS80Gs6gPAbCjCeDAhwjhydsUXFWPOXQ9FrSeo5riKLjdWWc9t0Xq16X",
    "verificationMethod": "http://localhost:3004/government/profile/card#key"
  }
}
```
## signPresentation02 


Alice creates a VP02 consisting of the following VCs:

- The derived identity credential 

- An identity binding VC, expressing the binding between the actual/true ID and the pseudonymous ID, signed by the key pair that is linked to Alice her actual identity.

- An identity binding VC, expressing the binding between the actual/true ID and the pseudonymous ID, signed by the key pair that is linked to Alice her pseudonymous identity.


Finally, Alice signs VP02 using her actual/true identity,
which she will present to the recruiter.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "type": [
    "VerifiablePresentation"
  ],
  "holder": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe",
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/bbs/v1",
        "https://w3id.org/citizenship/v1"
      ],
      "id": "urn:bnid:_:c14n0",
      "type": "VerifiableCredential",
      "credentialSubject": {
        "id": "urn:test:id000",
        "type": [
          "Person",
          "PermanentResident"
        ],
        "solid:webid": "http://localhost:3000/alice/profile/card#me"
      },
      "issuer": "http://localhost:3004/government/profile/card#me",
      "proof": {
        "type": "BbsBlsSignatureProof2020",
        "created": "2024-06-28T13:49:14Z",
        "nonce": "Pz+E2w4CLnrYJk47B2MhjqQN/6bXohTwcmxHVvq6erVAjFUHreZ+fKETZDVboHsZfWo=",
        "proofPurpose": "assertionMethod",
        "proofValue": "AA0fj6qu5j/wNcn2yXyU7fgeOln7NN4JSt6Fcw402OGosWmriPUKvx6zS0aVsnvxmupWi5kwJehVD4kC+3CS8LkEcFRLX7ZIHd6TtLCc5672ShLiwUzSwH6GfbfKj3SA6bQDpo2YRDbqCgrQUITOXPApwsWkNx0OimxqRm1xiTJV1hXxAFKA2DyeINDD9vkGojB7NAAAAHShXaCA4EFHcl4soeCk7QF7pdIBQJjUyLShps1PHj+G37QO3hRHjC7lEh1/H0Bud5cAAAACJk9ecDOJVt+Ds08wdDocpufg6BQ7GxmRum0XNeIhbJsLjYQp5wDNzO1V9EcuN4XXbMdzvbOsb33XoRzbvTwKALfyuez4zmDtYI15ugi5Lz5Gv1PWc8yAPVc2CsclzwRQiL0QSti3VIlOzXO017c/9QAAAAUIV6bnBmIYKEIsRtPTY+9mMW8EFjHMrGsLBADZIHfoo0H/RFULWrQSdnh6iZ7pV3l+cZ0/x63XCsgSsspjsyCSbJXOX57EPid0oldSRrHXMre+O7gxC4etLZ6AvIjJIIkAGa+6aqh+AJyEOxSenyRd6UMH6XQqMS80Gs6gPAbCjCeDAhwjhydsUXFWPOXQ9FrSeo5riKLjdWWc9t0Xq16X",
        "verificationMethod": "http://localhost:3004/government/profile/card#key"
      }
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/bbs/v1"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "issuer": "http://localhost:3000/alice/profile/card#me",
      "credentialSubject": {
        "ex:pseudoId": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe",
        "ex:trueId": "http://localhost:3000/alice/profile/card#me"
      },
      "proof": {
        "type": "BbsBlsSignature2020",
        "created": "2024-06-28T13:49:17Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "kw+webAqsH5FjROh9DcOWM+jTbLvndNRnOrRJpyWfXoYmvOfwen3uKyb+L9pueOxXnzy7QugCy9A8Uqg6uDpBGCKl9vYbEaSMeuQqI/jEFEeKBVaOR81Vz6rz2Q1fRLn0vUtqgAq1GD3aey8P6bSiQ==",
        "verificationMethod": "http://localhost:3000/alice/profile/card#key"
      }
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/bbs/v1"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "issuer": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe",
      "credentialSubject": {
        "ex:pseudoId": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe",
        "ex:trueId": "http://localhost:3000/alice/profile/card#me"
      },
      "proof": {
        "type": "BbsBlsSignature2020",
        "created": "2024-06-28T13:49:17Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "iIv8AGnfVHyQeZz7ykenL5XqNJeoXhmfppUp3yGTXJDP2LG/+sSZtMLk4GiykGS5IHdu/qvAC3aBwoj+4STYxtPK/H47rNWetTj+YyAwM61W9YHcCXhUueBxdX8b3p6vZbAc+1h96iUgedKrygbcJg==",
        "verificationMethod": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe#zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe"
      }
    }
  ],
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-28T13:49:17Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "jQ+uayjQxB26bkr2cE4MfAQ07E0RLyqatYPr9tyJUY05ij8bIyl30Z2WnCpRKcqnBw3nBWo8LiETn9iS5vfJcyl9Ppex73U7VSrq/AX1dGkSCUYHoZ7x/bwgjL5nxqZTOmiaK9HlI7c2R6PVrMGmHQ==",
    "verificationMethod": "http://localhost:3000/alice/profile/card#key"
  }
}
```
## verifyPresentation02 


The recruiter verifies VP02.
The verification result is as follows:

```json
{
  "verified": true,
  "results": [
    {
      "proof": {
        "@context": "https://w3id.org/security/v2",
        "type": "sec:BbsBlsSignature2020",
        "created": "2024-06-28T13:49:17Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "jQ+uayjQxB26bkr2cE4MfAQ07E0RLyqatYPr9tyJUY05ij8bIyl30Z2WnCpRKcqnBw3nBWo8LiETn9iS5vfJcyl9Ppex73U7VSrq/AX1dGkSCUYHoZ7x/bwgjL5nxqZTOmiaK9HlI7c2R6PVrMGmHQ==",
        "verificationMethod": "http://localhost:3000/alice/profile/card#key"
      },
      "verified": true
    }
  ]
}
```
