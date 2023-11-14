import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {readJsonFile} from "../../utils/io";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {Bls12381G2VCActor} from "../../components/solid-actor/AbstractVCActor";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {toDidKeyDocument} from "../../utils/keypair";
import {IVerificationMethod} from "../../components/solid-actor/did-interfaces";

/**
 * Build context map
 * @param actors
 * @returns {Map<any, any>}
 */
export function getContextMap() {
    const ctx = new Map();

    // VC
    ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
    // BBS context
    ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('src/contexts/vc-di-bbs-v1.json'))

    ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('src/contexts/suiteContext.json'))
    return ctx
}

describe('Bls12381G2VCActor extends AbstractVCActor', (): void => {

    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {
        documentLoader = createCustomDocumentLoader(getContextMap())
    });

    afterAll(async (): Promise<void> => {

    });


    it('Create, sign, and verify a VC using a did:key identifier & its DID Document', async () => {
        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from('testseed'))
        let key = await Bls12381G2KeyPair.generate({ seed })
        // Create its corresponding did:key DID Document
        const didKeyDocument = toDidKeyDocument(key)
        const {id, verificationMethod} = didKeyDocument
        const vm = (verificationMethod as IVerificationMethod[])[0]
        // Re-instantiate BLS12381 G2, but with set with the did:key identifiers
        key = new Bls12381G2KeyPair({
            id: vm.id,
            controller: id,
            privateKeyBase58: key.privateKey,
            publicKeyBase58: key.publicKey
        })

        const va = new Bls12381G2VCActor(key,documentLoader)
        await va.initialize();
        const c = va.createCredential({id: 'urn:test:did:key'})
        const vc = await va.signCredential(c)
        expect(vc.issuer).toStrictEqual(didKeyDocument.id)

        // The proof's verification method should be listed in the DID Document's
        // verification methods of type <proofPurpose>
        expect(Object(didKeyDocument)[vc.proof.proofPurpose].includes(vc.proof.verificationMethod)).toBeTruthy()

        const verificationResult = await va.verifyCredential(vc)
        if(verificationResult.verified !== true)
            console.error(verificationResult.error)
        expect(verificationResult).toHaveProperty('verified', true)
    })

});

