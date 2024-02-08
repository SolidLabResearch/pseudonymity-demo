import {describe, expect, it} from '@jest/globals';
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {toDidKeyDocument} from "../../utils/keypair";

import {IVerificationMethod} from "../../components/interfaces";


describe('Keypair utils', (): void => {

    function getTestBls12381G2() {
        // ref: https://github.com/hyperledger/aries-cloudagent-python/blob/main/aries_cloudagent/did/tests/test_did_key_bls12381g2.py
        const publicKeyBase58 = "mxE4sHTpbPcmxNviRVR9r7D2taXcNyVJmf9TBUFS1gRt3j3Ej9Seo59GQeCzYwbQgDrfWCwEJvmBwjLvheAky5N2NqFVzk4kuq3S8g4Fmekai4P622vHqWjFrsioYYDqhf9"
        const fingerprint =  "zUC71nmwvy83x1UzNKbZbS7N9QZx8rqpQx3Ee3jGfKiEkZngTKzsRoqobX6wZdZF5F93pSGYYco3gpK9tc53ruWUo2tkBB9bxPCFBUjq2th8FbtT4xih6y6Q1K9EL4Th86NiCGT"
        const did = `did:key:${fingerprint}`
        const keyId = `did:key:${fingerprint}#${fingerprint}`
        const controller = did
        const type = 'Bls12381G2Key2020'
        return { publicKeyBase58, fingerprint, did, keyId, controller, type}
    }

    it('Correctly resolves the did:key identifier for a Bls12381G2 keypair into its DID Key DID Document', async () => {
        const testBls12381G2 = getTestBls12381G2()
        const g2 = await Bls12381G2KeyPair.from({publicKeyBase58: testBls12381G2.publicKeyBase58})
        const didDoc = toDidKeyDocument(g2)

        expect(didDoc).toHaveProperty('id', testBls12381G2.did)
        expect(didDoc.verificationMethod).toBeDefined()
        expect(didDoc.verificationMethod).toHaveLength(1)

        const vm = (didDoc.verificationMethod as Array<IVerificationMethod>)[0]
        const expectedVm = {
            id: testBls12381G2.keyId,
            publicKeyBase58: testBls12381G2.publicKeyBase58,
            controller: testBls12381G2.controller,
            type: testBls12381G2.type
        } as IVerificationMethod

        expect(vm).toEqual(expectedVm)
    })

});

