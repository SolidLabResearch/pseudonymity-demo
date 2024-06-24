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
    "created": "2024-06-24T11:57:01Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "uQ7AHPDeBGOjaLmf8Im5pmVZpbGJRwbqcztTspQu+MlwUCsoICVzKn39xeJigiulYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==",
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
    "created": "2024-06-24T11:57:01Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "jTlcVMVsFej8/X+Xq0ViFu4XfJEZIo1rewCXOYJx4/qQckwkb/kYVhO2wAElVWoNMKVg9X44OT7IyqxonIH7xLuNJjBkG7KYma9urLMBCo4x5JoTWPaG1p7URXapIpy1ng+avITVXJin9XQoxPxyNA==",
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
    "created": "2024-06-24T11:57:01Z",
    "nonce": "2DGdnibR9NfML6GrFxg1sG4ZRsk5Hb9xAgNHxiz0ADbMToIe6zCFQ2l0OJ0EAiRA0lY=",
    "proofPurpose": "assertionMethod",
    "proofValue": "AAoDn5fk+Vhh1rUZlW7eScGiSelY3KBsPHa8GMFtc6bIfFIO98zVtaMRmL3gOJCEj+lYOaSMeqm1O57urm7kNpcw8pKgzr1hqCllmPJzFWb85P3kKf1Ku6icmQz68987Hbvk0K3ECoBVWI7bDkK7fHA3URoU7+Ul0h6miJKl3Z2uYw42ZfvEdzpaDPT0dzNss2E3qwAAAHSNnqnM/QiNpQI0Qawdbn7zdt6ESLOlg3dt9ItwFKntvUsbXvG5lgGm3b5jD/T+BPwAAAACciI5vkFySdpbow6IKur5aSZr52lG4l2kNqKqMgkC4LUbEau3NSfk8f7kGxeE+E2tnWQkmhAt2EAR1uiyUOlCwbiGVG7vNNGpTLsSU2mQo+V6o2Uv6ydp/615LP9Nt37CjOhnIycYZRYuZTO9hLCDFAAAAARj9QbPWxcO4sDMMP1rQDjvE/vT7k882zHsSrwaxhzUTGEXmp9WbT9esh32iA9hOehJH4uqlSWd2Y7j5PgQgLzmQLXA0xencmkmGl4deuU9OmxHsMUhmWKMptvia0qQ/1cgi1ufk42JoXxiqAecusb3c11b/5kHZroSvRJQi7yPQQ==",
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
        "created": "2024-06-24T11:57:01Z",
        "nonce": "2DGdnibR9NfML6GrFxg1sG4ZRsk5Hb9xAgNHxiz0ADbMToIe6zCFQ2l0OJ0EAiRA0lY=",
        "proofPurpose": "assertionMethod",
        "proofValue": "AAoDn5fk+Vhh1rUZlW7eScGiSelY3KBsPHa8GMFtc6bIfFIO98zVtaMRmL3gOJCEj+lYOaSMeqm1O57urm7kNpcw8pKgzr1hqCllmPJzFWb85P3kKf1Ku6icmQz68987Hbvk0K3ECoBVWI7bDkK7fHA3URoU7+Ul0h6miJKl3Z2uYw42ZfvEdzpaDPT0dzNss2E3qwAAAHSNnqnM/QiNpQI0Qawdbn7zdt6ESLOlg3dt9ItwFKntvUsbXvG5lgGm3b5jD/T+BPwAAAACciI5vkFySdpbow6IKur5aSZr52lG4l2kNqKqMgkC4LUbEau3NSfk8f7kGxeE+E2tnWQkmhAt2EAR1uiyUOlCwbiGVG7vNNGpTLsSU2mQo+V6o2Uv6ydp/615LP9Nt37CjOhnIycYZRYuZTO9hLCDFAAAAARj9QbPWxcO4sDMMP1rQDjvE/vT7k882zHsSrwaxhzUTGEXmp9WbT9esh32iA9hOehJH4uqlSWd2Y7j5PgQgLzmQLXA0xencmkmGl4deuU9OmxHsMUhmWKMptvia0qQ/1cgi1ufk42JoXxiqAecusb3c11b/5kHZroSvRJQi7yPQQ==",
        "verificationMethod": "http://localhost:3003/university/profile/card#key"
      }
    }
  ],
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-24T11:57:05Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "ihi4ytM0wwDdabMVnK2jkLAj1XU3lyqoBkufU328uUt5hhC92q1WqeOuOQNEElGmJ11Jnv3EWamCZATkLRzCvrMF94q/GCjPp7EMm1zp12dzQqEElOgNk4tEUmAgmqNHzUQEJsCEe3+tWNDHb1xUYg==",
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
        "created": "2024-06-24T11:57:05Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "ihi4ytM0wwDdabMVnK2jkLAj1XU3lyqoBkufU328uUt5hhC92q1WqeOuOQNEElGmJ11Jnv3EWamCZATkLRzCvrMF94q/GCjPp7EMm1zp12dzQqEElOgNk4tEUmAgmqNHzUQEJsCEe3+tWNDHb1xUYg==",
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
    "created": "2024-06-24T11:57:01Z",
    "nonce": "pBulGUayMvjSTBjT637/Atz/5pDCoOUKXN/jmNqKZlrM5iOhgp5CkLZr+OqUFsy6u04=",
    "proofPurpose": "assertionMethod",
    "proofValue": "AA0fj6kWvlR/pWsn64wGh0yxRzawutnjqKow5wPSZawTDtLFVmUxu1l6M8TlTZ/7pIgnsYUX8a17mqKCG5Oil/DdF24bdmDmFce3+KANXJub1kZuwIS1Ix/3ihZaUsqUnr05IoJjMZwGiNX1e9GCYicZoVnKDEqJDeD1yROVrMinmLzeS1fMNk88uQQxQYq/azCN+gAAAHSsfnmsbIIFVmMSlzggqapXaAltWMChjihb9gv6jjcUGw4A2FUULqynjUH9LXkK91oAAAACR72Z4y3KLxvBps5tUoTMs0HC8ymlsd6F1ZRYlJNH5ZkY/ESFLYe4Mr/fnhP2kcjqS5mul/rV47mQPOTLet2j3qd5Y40qNt6UfhrgJWkkqFWpVO835LcDbi8aFO6K3Zx8xncrs+3g7vjE1gg0pevaOQAAAAUvEYjyDmOUbVALHefTvP3i0h0xhlm/pz2H5CjiSFVLclbAuPDIB7PE7Hzljd4/CpYFo7NQjn/KBQePWDPALSfpWPhFDbTnLl1kWQo+J1gD9G6eyZRsmb4UQ/6HNwnhd/dyUxc9rVY4O2fZySdOlCnAWr5YZPlwR2ZawkoN/u2fvUmG+R0FzKZuniTnd/LUivB5hnOIOdXvf006fTxMRx0h",
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
        "created": "2024-06-24T11:57:01Z",
        "nonce": "pBulGUayMvjSTBjT637/Atz/5pDCoOUKXN/jmNqKZlrM5iOhgp5CkLZr+OqUFsy6u04=",
        "proofPurpose": "assertionMethod",
        "proofValue": "AA0fj6kWvlR/pWsn64wGh0yxRzawutnjqKow5wPSZawTDtLFVmUxu1l6M8TlTZ/7pIgnsYUX8a17mqKCG5Oil/DdF24bdmDmFce3+KANXJub1kZuwIS1Ix/3ihZaUsqUnr05IoJjMZwGiNX1e9GCYicZoVnKDEqJDeD1yROVrMinmLzeS1fMNk88uQQxQYq/azCN+gAAAHSsfnmsbIIFVmMSlzggqapXaAltWMChjihb9gv6jjcUGw4A2FUULqynjUH9LXkK91oAAAACR72Z4y3KLxvBps5tUoTMs0HC8ymlsd6F1ZRYlJNH5ZkY/ESFLYe4Mr/fnhP2kcjqS5mul/rV47mQPOTLet2j3qd5Y40qNt6UfhrgJWkkqFWpVO835LcDbi8aFO6K3Zx8xncrs+3g7vjE1gg0pevaOQAAAAUvEYjyDmOUbVALHefTvP3i0h0xhlm/pz2H5CjiSFVLclbAuPDIB7PE7Hzljd4/CpYFo7NQjn/KBQePWDPALSfpWPhFDbTnLl1kWQo+J1gD9G6eyZRsmb4UQ/6HNwnhd/dyUxc9rVY4O2fZySdOlCnAWr5YZPlwR2ZawkoN/u2fvUmG+R0FzKZuniTnd/LUivB5hnOIOdXvf006fTxMRx0h",
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
        "created": "2024-06-24T11:57:07Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "mTUd64dt1q+9yp0TtB/5QtWJh6TX/EqdmCa5Attb5gSY9iJuHpH9h37kCVFxZfHvXnzy7QugCy9A8Uqg6uDpBGCKl9vYbEaSMeuQqI/jEFEeKBVaOR81Vz6rz2Q1fRLn0vUtqgAq1GD3aey8P6bSiQ==",
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
        "created": "2024-06-24T11:57:07Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "r4CtohKnrIUaEz9I9xw+ZJSBVxcCPwkmHzajDkiW/4uxsGTosdCuXtNgzDZNqaLIIHdu/qvAC3aBwoj+4STYxtPK/H47rNWetTj+YyAwM61W9YHcCXhUueBxdX8b3p6vZbAc+1h96iUgedKrygbcJg==",
        "verificationMethod": "did:key:zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe#zUC79TstVxxe4f9EWDBxMCnfxB2BcFyEUNDruQ1NtLMvTyvRpUkRLWz9uhhkvTBhno4LDdwkKFWY767GQtPb34BSXaNQAFmhnadbDe398xAQwTaTgivdoMhx3ZtL9TZpLPiefMe"
      }
    }
  ],
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2024-06-24T11:57:07Z",
    "proofPurpose": "assertionMethod",
    "proofValue": "thZ9Uhtq69A9mK1ihUAN00qD/27e3IPnejf5c74vWfONKp7dM4B/l3U8VKQStmI1Bw3nBWo8LiETn9iS5vfJcyl9Ppex73U7VSrq/AX1dGkSCUYHoZ7x/bwgjL5nxqZTOmiaK9HlI7c2R6PVrMGmHQ==",
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
        "created": "2024-06-24T11:57:07Z",
        "proofPurpose": "assertionMethod",
        "proofValue": "thZ9Uhtq69A9mK1ihUAN00qD/27e3IPnejf5c74vWfONKp7dM4B/l3U8VKQStmI1Bw3nBWo8LiETn9iS5vfJcyl9Ppex73U7VSrq/AX1dGkSCUYHoZ7x/bwgjL5nxqZTOmiaK9HlI7c2R6PVrMGmHQ==",
        "verificationMethod": "http://localhost:3000/alice/profile/card#key"
      },
      "verified": true
    }
  ]
}
```
